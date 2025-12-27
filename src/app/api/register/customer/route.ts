import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 200 }
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 200 }
      );
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    return NextResponse.json(
      { success: true, message: "Customer registered successfully", userId: newUser._id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Customer registration error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Registration failed" },
      { status: 200 }
    );
  }
}