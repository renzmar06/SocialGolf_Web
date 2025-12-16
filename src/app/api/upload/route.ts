import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const files: File[] = data.getAll("images") as unknown as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: "No files received" }, { status: 400 });
    }

    const urls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${Date.now()}-${file.name}`;
      const path = join(process.cwd(), "public/uploads", filename);
      
      await writeFile(path, buffer);
      urls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ success: true, message: "Files uploaded successfully", urls });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
  }
}