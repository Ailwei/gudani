import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { verifyToken } from "@/utils/veriffyToken";

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json({ error: "chatId is required" }, { status: 400 });
    }
    const chat = await db.chat.findUnique({
      where: { id: chatId, userId: user.userId.toString() },
      include: { messages: true },
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ messages: chat.messages }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
