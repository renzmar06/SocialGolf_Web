import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UserDetail from "@/models/UserDetail";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const userId = formData.get("userId") as string;
    const city = formData.get("city") as string;
    const bio = formData.get("bio") as string;
    const skillLevel = formData.get("skillLevel") as string;
    const favoriteCourses = JSON.parse(formData.get("favoriteCourses") as string || "[]");
    const profileImageFile = formData.get("profileImage") as File | null;

    if (!userId || !city || !skillLevel) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 200 }
      );
    }

    let profileImageUrl: string | undefined;

    if (profileImageFile && profileImageFile.size > 0) {
      const uploadDir = "/tmp/uploads";
      await mkdir(uploadDir, { recursive: true });

      const buffer = Buffer.from(await profileImageFile.arrayBuffer());
      const filename = `${Date.now()}_${profileImageFile.name.replace(/\s+/g, "_")}`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      profileImageUrl = `/uploads/${filename}`;
    }

    const existingProfile = await UserDetail.findOne({ user: userId });
    
    if (existingProfile) {
      const updatedProfile = await UserDetail.findOneAndUpdate(
        { user: userId },
        {
          logo: profileImageUrl || existingProfile.logo,
          city,
          bio,
          skillLevel,
          favoriteCourses,
        },
        { new: true }
      );

      return NextResponse.json(
        { success: true, message: "Profile updated successfully", data: updatedProfile },
        { status: 200 }
      );
    } else {
      const newProfile = await UserDetail.create({
        user: userId,
        logo: profileImageUrl,
        city,
        bio,
        skillLevel,
        favoriteCourses,
      });

      return NextResponse.json(
        { success: true, message: "Profile created successfully", data: newProfile },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Profile operation failed" },
      { status: 200 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID required" },
        { status: 200 }
      );
    }

    const profile = await UserDetail.findOne({ user: userId });

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Profile not found" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, data: profile },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Profile fetch failed" },
      { status: 200 }
    );
  }
}