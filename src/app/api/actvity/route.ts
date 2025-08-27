import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const activities = [
    { type: "quiz", detail: "You completed a quiz on Algebra", date: "2024-07-01" },
    { type: "flashcards", detail: "You reviewed 10 flashcards for Photosynthesis", date: "2024-07-01" },
    { type: "summary", detail: "You generated a summary for Macbeth notes", date: "2024-06-30" }
  ];

  return NextResponse.json({ activities }, { status: 200 });
}
