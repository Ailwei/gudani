import { db } from "@/lib/prisma";
import { syllabusDataSchema } from "@/schemas/syllaubs";

export function chunkText(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    chunks.push(text.slice(start, start + maxLength));
    start += maxLength;
  }

  return chunks;
}

export async function saveSyllabusChunks(
  grade: string,
  subject: string,
  payload: { topic: string; text: string }[],
  maxLength: number = 2000
) {
  let totalChunks = 0;

  for (const item of payload) {
    const { topic, text } = item;
    syllabusDataSchema.parse({ grade, subject, topic, chunk: text });

    const chunks = chunkText(text, maxLength);

    for (const chunk of chunks) {
      await db.syllabusChunk.create({
        data: { grade, subject, topic, chunk },
      });
    }

    totalChunks += chunks.length;
  }

  return totalChunks;
}

export async function getSyllabusChunks(grade: string, subject: string) {
  return db.syllabusChunk.findMany({
    where: { grade, subject },
  });
}
