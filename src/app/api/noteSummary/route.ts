import { NextRequest, NextResponse } from "next/server"; 
import { getOpenAICompletion } from "@/utils/openAi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { document, grade, subject } = body;

    if (!document) {
      return NextResponse.json({ error: "Missing document" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const fullPrompt = `
Summarize the following notes${grade ? ` for ${grade} level` : ""}${subject ? ` in ${subject}` : ""}.

Also generate a topic/title for these notes.

Respond strictly in JSON with only these fields: "topic" and "summary".

Notes:
${document}
`;

    const aiResponse = await getOpenAICompletion(fullPrompt, apiKey);
    let text = aiResponse.choices?.[0]?.message?.content || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let parsed: any = {};
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (err) {
        console.error("Failed to parse JSON from GPT:", err, text);
      }
    }

    const topic = parsed.topic || "Untitled";
    const summary = parsed.summary || "No summary generated.";

    return NextResponse.json({ topic, summary }, { status: 200 });
  } catch (error: any) {
    console.error("Error generating summary:", error);
    return NextResponse.json({ error: "Failed to generate summary", details: error.message }, { status: 500 });
  }
}
