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
    const { grade, subject, topic, cards } = body;

    if (!grade || !subject || !topic || !cards) {
      return NextResponse.json(
        { error: "Missing required fields: grade, subject, topic, cards" },
        { status: 400 }
      );
    }
    const flashcardSet = await db.flashcardSet.create({
      data: {
        userId,
        grade,
        subject,
        topic,
        cards: {
          create: cards.map((c: any) => ({
            front: c.front,
            back: c.back,
          })),
        },
      },
      include: { cards: true },
    });

    return NextResponse.json({ flashcardSet }, { status: 201 });
  } catch (error: any) {
    console.error("Flashcard API error:", error);
    return NextResponse.json({ error: "Failed to save flashcards" }, { status: 500 });
  }
}
