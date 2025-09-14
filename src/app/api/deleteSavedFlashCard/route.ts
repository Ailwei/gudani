import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/veriffyToken";
import { db } from "@/lib/prisma";

export  async function DELETE(request: NextRequest) {
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
    const { setId } = body;

    let result;
    if (setId) {
      result = await db.flashcardSet.delete({
    where: { id: setId, userId: user.userId },
      });
    } else {
      result = await db.flashcardSet.deleteMany({
    where: { userId: user.userId },
      });
    }

    return NextResponse.json({ success: true, deleted: result });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
