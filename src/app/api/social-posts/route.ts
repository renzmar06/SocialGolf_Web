import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SocialPost from "@/models/SocialPost";
import { verifyToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const posts = await SocialPost.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, message: "Posts fetched successfully", posts });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    console.log("Decoded token:", decoded);

    await connectDB();
    const { content, postType, images, status } = await request.json();

    const post = await SocialPost.create({
      content,
      postType: postType || "General",
      images: images || [],
      status: status || "draft",
      author: decoded.name || decoded.email || "Unknown User",
    });

    const populatedPost = await SocialPost.findById(post._id);
    return NextResponse.json({ success: true, message: "Post created successfully", post: populatedPost }, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ success: false, message: "Failed to create post" }, { status: 500 });
  }
}