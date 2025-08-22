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

    const userId = String(user.userId);
    
    const body = await request.json();
    const { grade, subject, topic, questions } = body;

    if (!grade || !subject || !topic || !questions) {
      return NextResponse.json(
        { error: "Missing required fields: grade, subject, topic, questions" },
        { status: 400 }
      );
    }
    const quiz = await db.quiz.create({
      data: {
        userId,
        grade,
        subject,
        topic,
        questions: {
          create: questions.map((q: any) => ({
            question: q.question,
            options: q.options,
            correct: q.correct,
          })),
        },
      },
      include: { questions: true },
    });

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error: any) {
    console.error("Quiz API error:", error);
    return NextResponse.json({ error: "Failed to save quiz" }, { status: 500 });
  }
}
