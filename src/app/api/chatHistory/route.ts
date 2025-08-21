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

    const chats = await db.chat.findMany({
      where: { userId: user.userId.toString() },
      select: {
        id: true,
        title: true,
        created: true,
      },
      orderBy: { created: "desc" },
    });

    return NextResponse.json({ chats }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
