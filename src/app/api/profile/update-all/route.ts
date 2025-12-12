import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import UserDetail from "@/models/UserDetail";
import bcrypt from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function PUT(req: Request) {
  await connectDB();
  const formData = await req.formData();

  const userId = formData.get("userId") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string | null;

  // Update User
  const updateUser: any = { name };
  if (password) updateUser.password = await bcrypt.hash(password, 10);
  await User.findByIdAndUpdate(userId, updateUser);

  // Business Update
  const businessUpdate: any = {};

  const fields = ["businessName", "phoneNumber", "website", "type", "aboutBusiness", "streetAddress", "city", "state", "zip", "isVerified"];
  fields.forEach((f) => {
    const val = formData.get(f);
    if (val) businessUpdate[f] = val;
  });

  const businessHours = formData.get("businessHours");
  if (businessHours) businessUpdate.businessHours = JSON.parse(businessHours as string);

  const teamMembers = formData.get("teamMembers");
  if (teamMembers) businessUpdate.teamMembers = JSON.parse(teamMembers as string);

  const existingGallery = JSON.parse((formData.get("existingGallery") as string) || "[]");
  const newGalleryFiles = formData.getAll("gallery") as File[];

  // Handle Logo
  const logoFile = formData.get("logo") as File | null;
  if (logoFile && logoFile.size > 0) {
    const buffer = Buffer.from(await logoFile.arrayBuffer());
    const filename = `${Date.now()}-${logoFile.name.replace(/\s/g, "_")}`;
    const logoPath = path.join(process.cwd(), "public/uploads/logos", filename);
    await mkdir(path.dirname(logoPath), { recursive: true });
    await writeFile(logoPath, buffer);
    businessUpdate.logo = `/uploads/logos/${filename}`;
  }

  // Handle Gallery
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

  await UserDetail.findOneAndUpdate({ user: userId }, businessUpdate, { upsert: true });

  return NextResponse.json({ message: "Updated!" });
}