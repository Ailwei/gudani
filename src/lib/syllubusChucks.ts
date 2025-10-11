import { syllabusDataSchema } from "@/schemas/syllaubs";

export function chunkTextByWords(text: string, maxWords = 150): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let current: string[] = [];

  for (const word of words) {
    current.push(word);
    if (current.length >= maxWords) {
      chunks.push(current.join(" "));
      current = [];
    }
  }
  if (current.length > 0) chunks.push(current.join(" "));
  return chunks;
}

export async function saveSyllabusChunks(
  grade: string,
  subject: string,
  payload: { topic: string; chunk: string; concepts: string[] }[],
  maxWords: number = 150
) {
  let totalChunks = 0;

  for (let i = 0; i < payload.length; i++) {
    const { topic, chunk, concepts } = payload[i];

    syllabusDataSchema.parse({ grade, subject, topic, chunk, concepts, maxWords });

    const saved = await db.syllabusChunk.create({
      data: {
        grade,
        subject,
        topic,
        chunk,
        concepts,
        order: i + 1,
      },
    });
    totalChunks++;
  }

  return totalChunks;
}

import { db } from "@/lib/prisma";

export async function getSyllabusChunks(
  grade: string,
  subject: string,
  query?: string,     
  limit: number = 8 
) {
  const whereClause: any = { grade, subject };

  if (query && query.trim().length > 0) {
    const words = query
      .split(/\s+/)
      .map((w) => w.trim())
      .filter(Boolean);

    whereClause.OR = [
      { chunk: { contains: query, mode: "insensitive" } },
      { topic: { contains: query, mode: "insensitive" } },
      { concepts: { hasSome: words } },
    ];
  }

  const rows = await db.syllabusChunk.findMany({
    where: whereClause,
    orderBy: [{ topic: "asc" }, { order: "asc" }],
    ...(query ? { take: limit } : {}),
  });

  const grouped: {
    topic: string;
    chunks: { chunk: string; concepts: string[] }[];
  }[] = [];

  for (const row of rows) {
    let topicGroup = grouped.find((g) => g.topic === row.topic);
    if (!topicGroup) {
      topicGroup = { topic: row.topic, chunks: [] };
      grouped.push(topicGroup);
    }
    topicGroup.chunks.push({
      chunk: row.chunk,
      concepts: row.concepts || [],
    });
  }

  return grouped;
}
