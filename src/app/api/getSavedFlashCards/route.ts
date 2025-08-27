import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { verifyToken } from "@/utils/veriffyToken";

export async function GET(req: NextRequest) {
  try {
    const authHeaders = req.headers.get("authorization");
    if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeaders.split(" ")[1];
    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = String(user.userId);

    const sets = await db.flashcardSet.findMany({
      where: { userId },
      include: { cards: true },
    });

    return NextResponse.json({ flashcards: sets }, { status: 200 });
  } catch (error) {
    console.error("Fetch flashcards error:", error);
    return NextResponse.json(
      { error: "Failed to fetch flashcards" },
      { status: 500 }
    );
  }
}
