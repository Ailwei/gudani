import { NextRequest, NextResponse } from "next/server";
import { getOpenAICompletion } from "@/utils/openAi";
import { checkAndConsumeTokens } from "@/utils/tokenManager";
import { calculateTokens } from "@/utils/calculateToken";
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

    const userId = String(user.userId)
    const body = await request.json();
    const { topic, grade, subject, useSyllabus } = body;

    if (!topic || !grade || !subject || !userId || !useSyllabus) {
      return NextResponse.json(
        { error: "Missing required fields: topic, grade, or subject." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI API key not configured." },
        { status: 500 }
      );
    }
    
        
    const prompt = `
You are a South African CAPS curriculum expert.
Subject: "${subject}"
Grade: "${grade}"
Topic: "${topic}"
Question: Is this topic relevant to this subject at this grade level?
Respond with only "yes" or "no".
    `;

    let syllabusText = "";
    if (useSyllabus && grade && subject) {
      const syllabusChunks = await getSyllabusChunks(grade, subject, topic, 5);

      syllabusText = syllabusChunks
        .map(group =>
          group.chunks.map(ch => ch.chunk).join("\n\n")
        )
        .join("\n\n");
        syllabusChunks.flatMap(group => group.chunks.map(ch => ch.chunk))
    }

    const validationToken = calculateTokens(prompt, syllabusText)
    const validationConsumed = await checkAndConsumeTokens(userId, validationToken)

    if(!validationConsumed.success){
      return NextResponse.json({
        error: validationConsumed.error
      },
    {
      status: 403
    })
    }

    const validationResponse = await getOpenAICompletion(prompt);
    const validationText = (validationResponse.choices?.[0]?.message?.content || "")
      .trim()
      .toLowerCase();

    if (!validationText.startsWith("yes")) {
      return NextResponse.json(
        { error: `The topic "${topic}" is not relevant to "${subject}" for Grade ${grade}.` },
        { status: 400 }
      );
    }
    const quizPrompt = `
You are an expert South African CAPS curriculum teacher.
Create 5 multiple-choice quiz questions for the topic "${topic}" in ${subject} (Grade ${grade}).

RULES:
- Respond ONLY in valid JSON, no text outside JSON.
- Each question must have:
  - "question" (string)
  - "options" (array of 4 strings)
  - "correct" (string, exactly one of the options)
  - "explanation" (string)
  - "diagram" (string URL or null)
- No trailing commas.

Example:
{
  "topic": "Photosynthesis",
  "grade": "Grade 11",
  "subject": "Life Sciences",
  "questions": [
    {
      "question": "Which organelle is responsible for photosynthesis?",
      "options": ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"],
      "correct": "Chloroplast",
      "explanation": "Photosynthesis occurs in the chloroplasts, which contain chlorophyll.",
      "diagram": null
    }
  ]
}

Now create the quiz for:
Topic: "${topic}"
Subject: "${subject}"
Grade: "${grade}"
    `;

    const quizTokens = calculateTokens(quizPrompt);
    const quaizConsume = await checkAndConsumeTokens(userId, quizTokens);
    if(!quaizConsume.success){
      return NextResponse.json({
        error: quaizConsume.error
      }, {
        status: 403
      })
    }

    const aiResponse = await getOpenAICompletion(quizPrompt);

    let quizData;
    try {
      const rawContent = (aiResponse.choices?.[0]?.message?.content || "{}")
        .replace(/\n/g, "")
        .trim();
      quizData = JSON.parse(rawContent);
    } catch (err) {
      console.error("JSON parse failed:", err, "Raw content:", aiResponse.choices?.[0]?.message?.content);
      quizData = {
        topic,
        grade,
        subject,
        questions: [
          {
            question: "Failed to generate quiz. Please try a different topic.",
            options: ["Option 1", "Option 2", "Option 3", "Option 4"],
            correct: "Option 1",
            explanation: "The AI response was invalid or could not be parsed.",
            diagram: null
          }
        ]
      };
    }

    return NextResponse.json({ quiz: quizData }, { status: 200 });

  } catch (error: any) {
    console.error("Quiz API error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz.", details: error.message },
      { status: 500 }
    );
  }
}
