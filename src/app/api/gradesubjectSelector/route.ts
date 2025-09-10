import { NextResponse } from "next/server";

export async function GET() {
  const grades = ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];

  const subjects = {
    "Grade 8": [
      "Mathematics",
      "English",
      "Life Sciences",
      "History",
      "Geography",
      "Technology",
    ],
    "Grade 9": [
      "Mathematics",
      "English",
      "Life Sciences",
      "History",
      "Geography",
      "Technology",
    ],
    "Grade 10": [
      "Mathematics",
      "English",
      "Life Sciences",
      "Physical Sciences",
      "Accounting",
      "Business Studies",
    ],
    "Grade 11": [
      "Mathematics",
      "English",
      "Life Sciences",
      "Physical Sciences",
      "Accounting",
      "Business Studies",
    ],
    "Grade 12": [
      "Mathematics",
      "English",
      "Life Sciences",
      "Physical Sciences",
      "Accounting",
      "Business Studies",
    ],
  };

  return NextResponse.json({ grades, subjects }, { status: 200 });
}
