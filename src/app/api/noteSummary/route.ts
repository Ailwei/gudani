import { NextRequest, NextResponse } from "next/server";
import { getOpenAICompletion } from "@/utils/openAi";
import { getSyllabusChunks } from "@/lib/syllubusChucks";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { document, grade, subject } = body;

    if (!document) {
      return NextResponse.json({ error: "Missing document" }, { status: 400 });
    }

    const syllabusChunks = await getSyllabusChunks(grade, subject);

    if (!syllabusChunks || syllabusChunks.length === 0) {
      return NextResponse.json({ error: "No syllabus available for this grade/subject" }, { status: 400 });
    }

    const syllabusText = syllabusChunks.map((c: any) => c.chunk).join(" ");

    const relevanceCheckPrompt = `
You are a strict CAPS syllabus checker.
Compare the following notes with the Grade ${grade} ${subject} syllabus.

Syllabus:
${syllabusText}

Notes:
${document}

Answer ONLY "YES" if notes are related to syllabus, or "NO" if unrelated.
`;

    const relevanceResponse = await getOpenAICompletion(relevanceCheckPrompt);
    const isRelevant = relevanceResponse.choices?.[0]?.message?.content?.trim().toUpperCase();

    if (isRelevant !== "YES") {
      return NextResponse.json({ error: "Notes are not related to the selected syllabus." }, { status: 400 });
    }
    const fullPrompt = `
Summarize these notes for Grade ${grade} in ${subject}.
Also generate a topic/title.

Respond strictly in JSON: { "topic": string, "summary": string }

Notes:
${document}
`;

    const aiResponse = await getOpenAICompletion(fullPrompt);
    let text = aiResponse.choices?.[0]?.message?.content || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let parsed: any = {};
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.error("Failed to parse JSON from GPT:", err, text);
      }
    }

    return NextResponse.json(
      { topic: parsed.topic || "Untitled", summary: parsed.summary || "No summary generated." },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error generating summary:", error);
    return NextResponse.json({ error: "Failed to generate summary", details: error.message }, { status: 500 });
  }
}
