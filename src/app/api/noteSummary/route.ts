import { NextRequest, NextResponse } from "next/server";
import { getOpenAICompletion } from "@/utils/openAi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { document, prompt, grade, subject } = body;

    if (!document || !prompt) {
      return NextResponse.json({ error: "Missing document or prompt" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const fullPrompt = `
Summarize the following notes${grade ? ` for ${grade} level` : ""}${subject ? ` in ${subject}` : ""}:

${document}
`;

    const aiResponse = await getOpenAICompletion(fullPrompt, apiKey);

    const summary = aiResponse.choices?.[0]?.message?.content || "No summary generated.";

    return NextResponse.json({ summary }, { status: 200 });
  } catch (error: any) {
    console.error("Error generating summary:", error);
    return NextResponse.json({ error: "Failed to generate summary", details: error.message }, { status: 500 });
  }
}
