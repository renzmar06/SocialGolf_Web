import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import UserDetail from "@/models/UserDetail";
import bcrypt from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const parseJSONSafe = (str: string | null, fallback: any) => {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();

    const email = (formData.get("email") as string)?.toLowerCase().trim();
    const password = formData.get("password") as string;
    const businessName = (formData.get("businessName") as string)?.trim();

    if (!email || !password || !businessName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 400 }
      );
    }

    const selected = (formData.get("selected") as string) || "golf-course";
    const aboutBusiness = (formData.get("aboutBusiness") as string) || "";
    const streetAddress = (formData.get("streetAddress") as string) || "";
    const city = (formData.get("city") as string) || "";
    const state = (formData.get("state") as string) || "";
    const zip = (formData.get("zip") as string) || "";
    const phoneNumber = (formData.get("phoneNumber") as string) || "";
    const website = (formData.get("website") as string) || "";
    const businessHours = parseJSONSafe(formData.get("businessHours") as string, {});
    const teamMembersRaw = parseJSONSafe(formData.get("teamMembers") as string, []);

    // Handle file uploads
    const logoFile = formData.get("logo") as File | null;
    const verificationFile = formData.get("verificationDoc") as File | null;

    const logoDir = path.join(process.cwd(), "public/uploads/logos");
    const docDir = path.join(process.cwd(), "public/uploads/docs");
    await mkdir(logoDir, { recursive: true });
    await mkdir(docDir, { recursive: true });

    let logoUrl: string | undefined;
    let verificationUrl: string | undefined;

    if (logoFile && logoFile.size > 0) {
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const filename = `${Date.now()}-${logoFile.name.replace(/\s+/g, "_")}`;
      const filepath = path.join(logoDir, filename);
      await writeFile(filepath, buffer);
      logoUrl = `/uploads/logos/${filename}`;
    }

    if (verificationFile && verificationFile.size > 0) {
      const buffer = Buffer.from(await verificationFile.arrayBuffer());
      const filename = `${Date.now()}-${verificationFile.name.replace(/\s+/g, "_")}`;
      const filepath = path.join(docDir, filename);
      await writeFile(filepath, buffer);
      verificationUrl = `/uploads/docs/${filename}`;
    }

    // Clean team members — no passwords stored!
    const teamMembers = teamMembersRaw.map((m: any) => ({
      name: m.name?.trim() || "",
      email: m.email?.toLowerCase().trim() || "",
      role: m.role?.trim() || "Staff",
    }));

    // Create main admin user (password will be hashed by User model pre-save hook)
    const newUser = await User.create({
      name: businessName,
      email,
      password,
      role: "admin",
    });

    // Save business details
    await UserDetail.create({
      user: newUser._id,
      type: selected,
      businessName,
      aboutBusiness: aboutBusiness || undefined,
      streetAddress,
      city,
      state,
      zip,
      phoneNumber,
      website,
      logo: logoUrl,
      verificationDoc: verificationUrl,
      businessHours,
      teamMembers, // Safe: no passwords
      isVerified: false,
    });

    return NextResponse.json(
      { success: true, message: "Account created successfully! Team invites will be sent soon." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}