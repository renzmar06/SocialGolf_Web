import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SocialPost from "@/models/SocialPost";
import { verifyToken } from "@/lib/jwt";
import mongoose from "mongoose";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 200 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 200 });
    }

    await connectDB();
    const { id } = await context.params;
    const { content, postType, images, status } = await request.json();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid post ID" }, { status: 200 });
    }

    const post = await SocialPost.findByIdAndUpdate(
      id,
      { content, postType, images, status },
      { new: true }
    );

    if (!post) {
      return NextResponse.json({ success: false, message: "Post not found" }, { status: 200 });
    }

    return NextResponse.json({ success: true, message: "Post updated successfully", post });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ success: false, message: "Failed to update post" }, { status: 200 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 200 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 200 });
    }

    await connectDB();
    const { id } = await context.params;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid post ID" }, { status: 200 });
    }

    const post = await SocialPost.findByIdAndDelete(id);

    if (!post) {
      return NextResponse.json({ success: false, message: "Post not found" }, { status: 200 });
    }

    return NextResponse.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete post" }, { status: 200 });
  }
}