import { NextRequest, NextResponse } from "next/server";
import { getOpenAICompletion } from "@/utils/openAi";
import { getSyllabusChunks } from "@/lib/syllubusChucks";
import { verifyToken } from "@/utils/veriffyToken";

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

Syllabus (for guidance only):
${syllabusText}

Now summarize the notes and generate a topic/title.

Respond strictly in JSON format:
{ "topic": string, "summary": string }

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
      {
        topic: parsed.topic || "Untitled",
        summary: parsed.summary || "No summary generated.",
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
