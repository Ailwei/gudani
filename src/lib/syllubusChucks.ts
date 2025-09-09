import { db } from "@/lib/prisma";
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
  payload: { topic: string; text: string }[],
  maxWords: number = 150
) {
  let totalChunks = 0;

  for (const item of payload) {
    const { topic, text } = item;
    const chunks = chunkTextByWords(text, maxWords);

    for (let i = 0; i < chunks.length; i++) {
      syllabusDataSchema.parse({ grade, subject, topic, chunk: chunks[i] });

      await db.syllabusChunk.create({
        data: {
          grade,
          subject,
          topic,
          chunk: chunks[i],
          order: i + 1,
        },
      });
    }

    totalChunks += chunks.length;
  }

  return totalChunks;
}

export async function getSyllabusChunks(grade: string, subject: string) {
  return db.syllabusChunk.findMany({
    where: { grade, subject },
    orderBy: [{ topic: "asc" }, { order: "asc" }],
  });
}
