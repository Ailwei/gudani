import { NextRequest, NextResponse } from "next/server";
import { saveSyllabusChunks } from "@/lib/syllubusChucks";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payload, grade, subject } = body;
    console.log("froent esnd sent", payload, grade, subject)

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

    let totalChunks = 0;

    for (const item of payload) {
      const { topic, chunks } = item;
      if (!topic || !chunks || !Array.isArray(chunks)) continue;

      const formattedChunks = chunks.map((c: string) => ({
        topic,
        text: c,
      }));

      const count = await saveSyllabusChunks(grade, subject, formattedChunks, 2000);
      totalChunks += count;
    }

    return NextResponse.json({
      message: `Saved ${totalChunks} chunks for ${grade} ${subject}`,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload syllabus", details: err.message },
      { status: 500 }
    );
  }
}
