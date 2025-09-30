import { NextRequest, NextResponse } from "next/server";
import { getOpenAICompletion } from "@/utils/openAi";
import { getSyllabusChunks } from "@/lib/syllubusChucks";
import { verifyToken } from "@/utils/veriffyToken";
import { checkAndConsumeTokens } from "@/utils/tokenManager";
import { calculateTokens } from "@/utils/calculateToken";

export async function POST(request: NextRequest) {
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
    const { document, grade, subject } = body;

    const syllabusChunks = await getSyllabusChunks(grade, subject);
    const syllabusText = syllabusChunks.map((c: any) => c.chunk).join(" ");

    const fullPrompt = `
You are a CAPS syllabus-aligned study assistant.

Summarize these notes clearly for a Grade ${grade} student in ${subject}.
Use the CAPS syllabus below as a guideline for phrasing and relevance, but do not reject the notes.

Guidelines:
- Adjust the length of the summary to match the length of the notes (short notes → short summary, long notes → detailed multi-section summary).
- Use clear headings and subheadings where appropriate.
- Highlight key ideas with bullet points or numbered lists.
- Make the language simple and easy to read for a student.

Syllabus (for guidance only):
${syllabusText}

Notes:
${document}

Respond in human-readable text (Markdown or structured text). Do not return JSON.
`;

    const validationTokens = calculateTokens(fullPrompt);
    const validationConsumed = await checkAndConsumeTokens(user.userId, validationTokens);
    if (!validationConsumed.success) {
      return NextResponse.json({ error: validationConsumed.error }, { status: 403 });
    }

    const aiResponse = await getOpenAICompletion(fullPrompt);
    let text = aiResponse.choices?.[0]?.message?.content || "";

    return NextResponse.json(
      {
        topic: "Summary",
        summary: text.trim() || "No summary generated.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary", details: error.message },
      { status: 500 }
    );
  }
}
