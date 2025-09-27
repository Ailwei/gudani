import { NextRequest, NextResponse } from "next/server";
import { saveSyllabusChunks } from "@/lib/syllubusChucks";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payload, grade, subject } = body;
    console.log("Incoming payload:", payload);

    if (!payload || !Array.isArray(payload) || payload.length === 0) {
      return NextResponse.json(
        { error: "No syllabus topics to save" },
        { status: 400 }
      );
    }

    if (!grade || !subject) {
      return NextResponse.json(
        { error: "Grade and subject are required" },
        { status: 400 }
      );
    }

    const count = await saveSyllabusChunks(grade, subject, payload, 2000);

    return NextResponse.json({
      message: `Saved ${count} chunks for ${grade} ${subject}`,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload syllabus", details: err.message },
      { status: 500 }
    );
  }
}
