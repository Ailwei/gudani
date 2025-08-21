import { NextRequest, NextResponse } from "next/server";
import { getOpenAICompletion } from "@/utils/openAi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, grade, subject } = body;

    if (!topic || !grade || !subject) {
      return NextResponse.json({ error: "Missing required fields: topic, grade, subject" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI API key not configured" }, { status: 500 });
    }

    const prompt = `
You are a South African CAPS curriculum expert.
Create 5 flashcards for Grade ${grade} in ${subject} on the topic "${topic}".
Respond ONLY with a JSON array, no text outside JSON.
Each flashcard must have:
- "front": string (question)
- "back": string (answer)
`;

    const aiResponse = await getOpenAICompletion(prompt, apiKey);
    const rawText = aiResponse.choices?.[0]?.message?.content?.trim() || "";

    let flashcards: { front: string; back: string }[] = [];
    try {
      const firstBracket = rawText.indexOf("[");
      const lastBracket = rawText.lastIndexOf("]");
      if (firstBracket >= 0 && lastBracket > firstBracket) {
        const jsonString = rawText.slice(firstBracket, lastBracket + 1);
        const parsed = JSON.parse(jsonString);
        if (Array.isArray(parsed)) flashcards = parsed;
      }
    } catch (err) {
      console.error("Flashcard JSON parse failed:", err);
    }

    if (flashcards.length === 0) {
      flashcards = [
        { front: `No flashcards generated for "${topic}"`, back: "Try a different topic." }
      ];
    }

    return NextResponse.json({ flashcards }, { status: 200 });

  } catch (error: any) {
    console.error("Flashcard API error:", error);
    return NextResponse.json({ error: "Failed to generate flashcards", details: error.message }, { status: 500 });
  }
}
