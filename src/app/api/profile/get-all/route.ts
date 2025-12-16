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

    // No token
    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 200 } // ← Always 200
      );
    }

    const decoded = verifyToken(token);

    // Invalid or expired token
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 200 }
      );
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 200 }
      );
    }

    const userDetail = await UserDetail.findOne({ user: decoded.userId });

    return NextResponse.json(
      {
        success: true,
        message: "Profile fetched successfully",
        user,
        userDetail: userDetail || null,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in profile/get-all:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 200 } // ← Even server errors return 200
    );
  }
}