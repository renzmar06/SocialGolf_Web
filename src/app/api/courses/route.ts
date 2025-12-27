import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";

export async function GET() {
  try {
    await connectDB();
    
    const courses = await Course.find({ isActive: true }).sort({ name: 1 });

    return NextResponse.json(
      { success: true, message: "Courses fetched successfully", data: courses },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Courses fetch error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch courses" },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { name, location, description } = await request.json();

    if (!name || !location) {
      return NextResponse.json(
        { success: false, message: "Name and location are required" },
        { status: 200 }
      );
    }

    const newCourse = await Course.create({
      name,
      location,
      description,
    });

    return NextResponse.json(
      { success: true, message: "Course created successfully", data: newCourse },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Course creation error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create course" },
      { status: 200 }
    );
  }
}