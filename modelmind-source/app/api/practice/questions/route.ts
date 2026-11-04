import { NextResponse } from "next/server";

import { allPublicPracticeQuestions } from "@/lib/practice";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ questions: allPublicPracticeQuestions() });
}
