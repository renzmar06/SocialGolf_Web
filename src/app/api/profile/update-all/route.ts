// Example: /app/api/profile/update/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import UserDetail from "@/models/UserDetail";
import bcrypt from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function PUT(req: Request) {
  try {
    await connectDB();
    const formData = await req.formData();

    const userId = formData.get("userId") as string;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 200 }
      );
    }

    // === Update User ===
    const name = formData.get("name") as string;
    const password = formData.get("password") as string | null;

    const updateUser: any = { name: name?.trim() || "" };
    if (password && password.trim()) {
      updateUser.password = await bcrypt.hash(password.trim(), 10);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateUser, { new: true });
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 200 }
      );
    }

    // === Prepare Business Update ===
    const businessUpdate: any = {};

    const fields = [
      "businessName",
      "phoneNumber",
      "website",
      "type",
      "aboutBusiness",
      "streetAddress",
      "city",
      "state",
      "zip",
      "isVerified",
    ];

    fields.forEach((f) => {
      const val = formData.get(f);
      if (val !== null && val !== undefined) {
        businessUpdate[f] = val.toString().trim() || undefined;
      }
    });

    const businessHours = formData.get("businessHours");
    if (businessHours) {
      try {
        businessUpdate.businessHours = JSON.parse(businessHours as string);
      } catch {
        return NextResponse.json(
          { success: false, message: "Invalid businessHours format" },
          { status: 200 }
        );
      }
    }

    const teamMembers = formData.get("teamMembers");
    if (teamMembers) {
      try {
        businessUpdate.teamMembers = JSON.parse(teamMembers as string);
      } catch {
        return NextResponse.json(
          { success: false, message: "Invalid teamMembers format" },
          { status: 200 }
        );
      }
    }

    // === Handle Logo ===
    const logoFile = formData.get("logo") as File | null;
    if (logoFile && logoFile.size > 0) {
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const filename = `${Date.now()}-${logoFile.name.replace(/\s/g, "_")}`;
      const logoDir = path.join(process.cwd(), "public/uploads/logos");
      await mkdir(logoDir, { recursive: true });
      await writeFile(path.join(logoDir, filename), buffer);
      businessUpdate.logo = `/uploads/logos/${filename}`;
    }

    // === Handle Gallery ===
    let existingGallery: string[] = [];
    const existingGalleryRaw = formData.get("existingGallery");
    if (existingGalleryRaw) {
      try {
        existingGallery = JSON.parse(existingGalleryRaw as string);
      } catch {
        return NextResponse.json(
          { success: false, message: "Invalid existingGallery format" },
          { status: 200 }
        );
      }
    }

    const newGalleryFiles = formData.getAll("gallery") as File[];
    const galleryUrls = [...existingGallery];
    const galleryDir = path.join(process.cwd(), "public/uploads/gallery");
    await mkdir(galleryDir, { recursive: true });

    for (const file of newGalleryFiles) {
      if (file.size === 0) continue;
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name.replace(/\s/g, "_")}`;
      const filepath = path.join(galleryDir, filename);
      await writeFile(filepath, buffer);
      galleryUrls.push(`/uploads/gallery/${filename}`);
    }

    businessUpdate.gallery = galleryUrls;

    // === Save Business Details ===
    await UserDetail.findOneAndUpdate(
      { user: userId },
      businessUpdate,
      { upsert: true, new: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully!",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update profile",
      },
      { status: 200 }
    );
  }
}