import { NextResponse, NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { verifyToken } from "@/utils/veriffyToken";
import { id } from "zod/v4/locales";

export async function GET(req: NextRequest) {
  try {
    const authHeaders = req.headers.get("authorization");
    if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const token = authHeaders.split(" ")[1];
    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = String(user.userId);

   
    const summaries = await db.noteSummary.findMany({
      where: { userId },
      select: {
        id: true,
        subject: true,
        grade: true,
        topic: true,
        summary: true,
        created: true,
      },
      orderBy: {
        created: "desc",
      },
    });
    console.log("Summaries:", summaries);

    return NextResponse.json({ summaries }, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching summaries:", error);
    return NextResponse.json(
      { error: "Failed to fetch summaries", details: error.message },
      { status: 500 }
    );
  }
}
