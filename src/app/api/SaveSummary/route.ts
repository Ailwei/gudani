import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { verifyToken } from "@/utils/veriffyToken";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { grade, subject, notes, summary } = body;

    const saveSummary = await db.noteSummary.create({
      data: {
        userId: user.userId,
        grade,
        subject,
        notes,
        summary,
      },
    });

    return NextResponse.json({ success: true, summary: saveSummary }, { status: 201 });
  } catch (err: any) {
    console.error("Save summary error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
