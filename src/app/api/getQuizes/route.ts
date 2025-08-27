import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { verifyToken } from "@/utils/veriffyToken";


export async function GET(req: NextRequest) {
    try {
        const authHeaders = req.headers.get("authorization");
        if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
            return NextResponse.json({
                error: "UnAunthorized"
            }, { status: 401 })
        }
        const token = authHeaders.split(" ")[1];
        const user = verifyToken(token);

        if (!user) {
            return NextResponse.json({ error: "Invalid token" },
                { status: 401 });
        }
        const userId = String(user.userId);
        const quizzes = await db.quiz.findMany({
            where: {
                userId
            },
            include: { questions: true },
            orderBy: { created: "desc" }
        });


        return NextResponse.json({ quizzes }, { status: 200 });
    } catch (error) {
        console.error("Fetch quizzes error:", error);
        return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });

    }

}