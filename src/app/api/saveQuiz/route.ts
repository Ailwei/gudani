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
    const { quizId, grade, subject, topic, questions, userAnswer } = body;
    
    if (!grade || !subject || !topic || !questions) {
      return NextResponse.json(
        { error: "Missing required fields: grade, subject, topic, questions" },
        { status: 400 }
      );
    }
    let quiz;
if (quizId) {
  quiz = await db.quiz.update({
    where: { id: quizId },
    data: {
      grade,
      subject,
      topic,
      questions: {
        updateMany: questions.map((q: any) => ({
          where: { id: q.id },
          data: { userAnswer: q.userAnswer ?? null },
        })),
      },
    },
    include: { questions: true },
  });
} else {
  quiz = await db.quiz.create({
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
          explanation: q.explanation,
          userAnswer: q.userAnswer ?? null,
        })),
      },
    },
    include: { questions: true },
  });
}

return NextResponse.json({ quiz }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to save quiz" }, { status: 500 });
  }
}
