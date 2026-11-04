import { NextResponse, type NextRequest } from "next/server";

import { authRequestIsSameOrigin, getAuthenticatedUser } from "@/lib/auth";
import { getPracticeQuestion, gradingModeFor, hasJudgeTests } from "@/lib/practice";

export const runtime = "nodejs";

type GradeRequest = {
  questionId?: unknown;
  answer?: unknown;
  code?: unknown;
  mode?: unknown;
};

function requestText(value: unknown, maxLength: number) {
  return typeof value === "string" && value.length <= maxLength ? value : null;
}

async function callIsolatedJudge(questionId: string, code: string, mode: "run" | "submit") {
  const judgeUrl = process.env.PRACTICE_JUDGE_URL?.replace(/\/+$/, "");
  const judgeToken = process.env.PRACTICE_JUDGE_TOKEN;
  if (!judgeUrl || !judgeToken) {
    return { unavailable: true as const };
  }
  const response = await fetch(`${judgeUrl}/v1/submissions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${judgeToken}`,
    },
    body: JSON.stringify({ questionId, code, mode }),
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
  });
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = typeof result === "object" && result !== null && "error" in result
      ? String((result as { error: unknown }).error)
      : "The isolated code judge did not accept this submission.";
    throw new Error(detail);
  }
  return { unavailable: false as const, result };
}

export async function POST(request: NextRequest) {
  if (!authRequestIsSameOrigin(request)) {
    return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  }
  if (!(await getAuthenticatedUser())) {
    return NextResponse.json({ error: "Sign in to submit a practice answer." }, { status: 401 });
  }

  let body: GradeRequest;
  try {
    body = await request.json() as GradeRequest;
  } catch {
    return NextResponse.json({ error: "Enter an answer before checking it." }, { status: 400 });
  }
  const questionId = requestText(body.questionId, 160);
  if (!questionId) return NextResponse.json({ error: "Choose a valid practice question." }, { status: 400 });
  const question = getPracticeQuestion(questionId);
  if (!question) return NextResponse.json({ error: "Practice question was not found." }, { status: 404 });

  const gradingMode = gradingModeFor(question);
  if (gradingMode === "exact") {
    const answer = requestText(body.answer, 2_000)?.trim();
    if (!answer) return NextResponse.json({ error: "Enter an answer before checking it." }, { status: 400 });
    if (question.options?.length && question.correctOption !== undefined) {
      const selectedOption = Number(answer);
      if (!Number.isInteger(selectedOption) || selectedOption < 0 || selectedOption >= question.options.length) {
        return NextResponse.json({ error: "Choose one of the listed options." }, { status: 400 });
      }
      const correct = selectedOption === question.correctOption;
      return NextResponse.json({ mode: "exact", correct, explanation: question.explanation ?? "Review the concept and try again." });
    }
    const supplied = Number(answer);
    const expected = Number(question.expectedAnswer);
    if (!Number.isFinite(supplied) || !Number.isFinite(expected)) {
      return NextResponse.json({ error: "Enter a finite numerical answer." }, { status: 400 });
    }
    const tolerance = Math.max(0.001, Math.abs(expected) * 0.0001);
    return NextResponse.json({
      mode: "exact",
      correct: Math.abs(supplied - expected) <= tolerance,
      explanation: question.explanation ?? `Expected a value within ±${tolerance} of the reference answer.`,
    });
  }

  if (gradingMode !== "code") {
    return NextResponse.json({ error: "Use AI teacher feedback for this open-ended response." }, { status: 400 });
  }
  const code = requestText(body.code, 30_000)?.trim();
  if (!code) return NextResponse.json({ error: "Write code before running checks." }, { status: 400 });
  if (!hasJudgeTests(question.id)) {
    return NextResponse.json({
      mode: "code",
      testsAvailable: false,
      message: "This exercise has no hidden test set yet. Ask the AI teacher for rubric feedback, then mark it complete when you understand the solution.",
    });
  }
  const mode = body.mode === "run" ? "run" : "submit";
  try {
    const judge = await callIsolatedJudge(question.id, code, mode);
    if (judge.unavailable) {
      return NextResponse.json({
        error: "The restricted code judge is not connected. It must be deployed as a private service before code submissions are enabled.",
        code: "judge_unavailable",
      }, { status: 503 });
    }
    return NextResponse.json({ mode: "code", testsAvailable: true, ...judge.result as object });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "The isolated code judge is unavailable." }, { status: 502 });
  }
}
