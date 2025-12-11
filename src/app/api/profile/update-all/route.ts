// /app/api/profile/update-all/route.ts
import { NextResponse } from "next/server";
import User from "@/models/User";
import UserDetail from "@/models/UserDetail";
import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  await connectDB();

  const { user, business } = await req.json();

  const userId = user._id;

  let finalPassword = user.password;

  // Hash only if password is NOT already hashed
  if (!user.password.startsWith("$2b$")) {
    finalPassword = await bcrypt.hash(user.password, 10);
  }

  // Update user basic info
  await User.findByIdAndUpdate(userId, {
    name: user.name,
    password: finalPassword,
  });

  // Update business / user detail info
  await UserDetail.findOneAndUpdate({ user: userId }, business);

  return NextResponse.json({ message: "Profile Updated Successfully" });
}
