// /app/api/profile/get-all/route.ts
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import UserDetail from "@/models/UserDetail";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await User.findById(decoded.userId).select("-password");
    const userDetail = await UserDetail.findOne({ user: decoded.userId });

    return NextResponse.json({ user, userDetail }, { status: 200 });
  } catch (error) {
    console.error("Error in profile/get-all:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
