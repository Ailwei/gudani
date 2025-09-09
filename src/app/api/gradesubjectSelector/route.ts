import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const grades = ['Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  const subjects = [
    'Mathematics',
    'Physical Sciences',
    'Life Sciences',
    'English',
    'History',
    'Geography',
    'Accounting',
    'Business Studies',
    'Technollogy'
];

  return NextResponse.json({ grades, subjects }, { status: 200 });
}
