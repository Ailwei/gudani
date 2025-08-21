import { NextRequest, NextResponse } from "next/server";

// Example: return recent activity for the dashboard
export async function GET() {
  // Replace with real activity data from your database if needed
  const activities = [
    { type: "quiz", detail: "You completed a quiz on Algebra", date: "2024-07-01" },
    { type: "flashcards", detail: "You reviewed 10 flashcards for Photosynthesis", date: "2024-07-01" },
    { type: "summary", detail: "You generated a summary for Macbeth notes", date: "2024-06-30" }
  ];

  return NextResponse.json({ activities }, { status: 200 });
}

// The hardcoded activities are just a placeholder/example.
// In a real app, you would fetch recent activity from your database for the authenticated user.
// Replace the hardcoded array with a database query (e.g., Prisma) to return real activity data.
