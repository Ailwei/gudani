import { NextRequest, NextResponse } from "next/server";
import { getOpenAICompletion } from "@/utils/openAi";
import { db } from "@/lib/prisma";
import { getSyllabusChunks } from "@/lib/syllubusChucks";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions/index.mjs";
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

    const userId = String(user.userId);
    const body = await request.json();
    const { prompt, chatId, grade, subject, useSyllabus, limit } = body;

    if (!prompt || !userId || !grade || !subject || useSyllabus === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: prompt, grade, or subject" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      );
    }
// Fetch relevant chunks based on the user prompt
let syllabusChunks = await getSyllabusChunks(grade, subject, prompt);


if (syllabusChunks.length === 0 && useSyllabus) {
  syllabusChunks = (await getSyllabusChunks(grade, subject)).slice(0, 3);
}

console.log("syllabus chunks used:", syllabusChunks.length);

const syllabusText = syllabusChunks
  .map((topicItem: any) => {
    const allChunks = topicItem.chunks
      .map((c: any) => `Chunk: ${c.chunk}\nConcepts: ${c.concepts?.join(", ") || "None"}`)
      .join("\n\n");
    return `Topic: ${topicItem.topic}\n${allChunks}`;
  })
  .join("\n\n");

console.log("Syllabus text length:", syllabusText.length);




    const toknsToUse = calculateTokens(prompt, syllabusText)
    console.log("toekn to use", toknsToUse)
    const tokensCheck = await checkAndConsumeTokens(userId, toknsToUse);
    console.log("token check", tokensCheck)
if (!tokensCheck.success) {
  return NextResponse.json(
    { error: tokensCheck.error }, 
    { status: 403 }
  );
}

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are an expert South African school tutor using the CAPS syllabus for ${subject} for ${grade}.
Always base answers on the syllabus content provided.
If a diagram would make the explanation clearer.
Do not describe the diagram in words unless asked — output the diagram code so it can be rendered visually.`,
      },
      {
        role: "user",
        content: `${syllabusText ? `Syllabus:\n${syllabusText}\n\n` : ""}${prompt}`,
      },
    ];

    const aiResponse = await getOpenAICompletion(messages);
    const answer =
      aiResponse?.choices?.[0]?.message?.content ??
      "Sorry, there was a problem with the AI service. Please try again later.";
let chat;

if (chatId) {
  chat = await db.chat.findUnique({
    where: { id: chatId },
    include: { messages: true },
  });
}

if (!chat) {
  const questionMatch = prompt.match(/Question:\s*(.*)/i);
  const shortTitle = questionMatch ? questionMatch[1].slice(0, 50) : "New Chat";

  chat = await db.chat.create({
    data: {
      userId,
      title: shortTitle,
      grade,
      subject,
      messages: {
        create: [
          { role: "user", content: prompt },
          { role: "ai", content: answer },
        ],
      },
    },
    include: { messages: true },
  });
} else {
  await db.message.create({ data: { chatId: chat.id, role: "user", content: prompt } });
  await db.message.create({ data: { chatId: chat.id, role: "ai", content: answer } });

  chat = await db.chat.findUnique({
    where: { id: chat.id },
    include: { messages: true },
  });
}

    return NextResponse.json({ response: answer, chat }, { status: 200 });
  } catch (error: any) {
    console.error("ChatBot API error:", error);
    return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
  }
}
