import { NextRequest, NextResponse } from "next/server";
import { getOpenAICompletion } from "@/utils/openAi";
import { verifyToken } from "@/utils/veriffyToken";
import { checkAndConsumeTokens } from "@/utils/tokenManager";
import { calculateTokens } from "@/utils/calculateToken";
import { getSyllabusChunks } from "@/lib/syllubusChucks";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions/index.mjs";


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
    const userId = String(user.userId);

    const body = await request.json();
    const { topic, grade, subject, useSyllabus } = body;

    if (!topic || !grade || !subject) {
      return NextResponse.json({ error: "Missing required fields: topic, grade, subject" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI API key not configured" }, { status: 500 });
    }
    const validationPrompt = `
You are a South African CAPS curriculum expert.
Subject: "${subject}"
Grade: "${grade}"
Topic: "${topic}"
Question: Is this topic relevant to this subject at this grade level?
Respond with only "yes" or "no".
`;

    const validationTokens = calculateTokens(validationPrompt);
    const validationConsumed = await checkAndConsumeTokens(userId, validationTokens);
    if (!validationConsumed.success) {
      return NextResponse.json({ error: validationConsumed.error }, { status: 403 });
    }

    const validationMessages: ChatCompletionMessageParam[] = [
      { role: "system", content: "You are a strict validator for CAPS curriculum relevance." },
      { role: "user", content: validationPrompt },
    ];

    const validationResponse = await getOpenAICompletion(validationMessages);
    const validationText = validationResponse.choices?.[0]?.message?.content?.trim().toLowerCase() || "";

    if (!validationText.startsWith("yes")) {
      return NextResponse.json(
        { error: `The topic "${topic}" is not relevant to "${subject}" for Grade ${grade}.` },
        { status: 400 }
      );
    }
    const basePrompt = `
You are a South African CAPS curriculum expert.
Create 5 flashcards for Grade ${grade} in ${subject} on the topic "${topic}".
Respond ONLY with a JSON array, no text outside JSON.
Each flashcard must have:
- "front": string (question)
- "back": string (answer)
`;

   let syllabusText = "";
if (useSyllabus && grade && subject) {
  const syllabusChunks = await getSyllabusChunks(grade, subject, topic, 5);

  syllabusText = syllabusChunks
    .map(group => group.chunks.map(ch => ch.chunk).join("\n\n"))
    .join("\n\n");
    syllabusChunks.flatMap(group => group.chunks.map(ch => ch.chunk))
}


    const fullPrompt = `${syllabusText ? `Syllabus:\n${syllabusText}\n\n` : ""}${basePrompt}`;

    const flashcardTokens = calculateTokens(fullPrompt);
    const tokensCheck = await checkAndConsumeTokens(userId, flashcardTokens);
    if (!tokensCheck.success) {
      return NextResponse.json({ error: tokensCheck.error }, { status: 403 });
    }

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: "You are an expert South African CAPS tutor." },
      { role: "user", content: fullPrompt },
    ];

    const aiResponse = await getOpenAICompletion(messages);
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
        { front: `No flashcards generated for "${topic}"`, back: "Try a different topic." },
      ];
    }

    return NextResponse.json({ flashcards }, { status: 200 });
  } catch (error: any) {
    console.error("Flashcard API error:", error);
    return NextResponse.json({ error: "Failed to generate flashcards", details: error.message }, { status: 500 });
  }
}
