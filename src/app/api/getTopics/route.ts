import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/veriffyToken";
import { db } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const userId = await verifyToken(token);

    if (!userId) {
      return NextResponse.json(
        { error: "Token expired or no token found" },
        { status: 401 }
      );
    }

    const rawData = await db.syllabusChunk.findMany({
      select: {
        id: true,
        topic: true,
        chunk: true,
        concepts: true, // ✅ must exist in your schema
      },
    });

    const topicMap = new Map<
      string,
      {
        topic: string;
        chunks: {
          name: string;
          concepts: string[];
        }[];
      }
    >();

    for (const entry of rawData) {
      if (!topicMap.has(entry.topic)) {
        topicMap.set(entry.topic, { topic: entry.topic, chunks: [] });
      }

      const topicObj = topicMap.get(entry.topic)!;

      // find if chunk already exists
      let chunkObj = topicObj.chunks.find((c) => c.name === entry.chunk);
      if (!chunkObj) {
        chunkObj = { name: entry.chunk, concepts: [] };
        topicObj.chunks.push(chunkObj);
      }

      for (const concept of entry.concepts || []) {
        if (!chunkObj.concepts.includes(concept)) {
          chunkObj.concepts.push(concept);
        }
      }
    }

    const topics = Array.from(topicMap.values());

    return NextResponse.json({ topics });
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
