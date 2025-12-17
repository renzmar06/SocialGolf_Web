import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    const user = await User.findOne({ email, isActive: true });
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 200 });
    }

    const token = signToken({ userId: user._id, email: user.email, role: user.role });
    
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
      token
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Login failed" }, { status: 200 });
  }
}