import "server-only";

import questionBank from "@/data/modelmind-practice-private.json";

export type PracticeGradingMode = "exact" | "code" | "ai";

export type PracticeQuestion = {
  id: string;
  topic: string;
  level: string;
  type: string;
  title: string;
  question: string;
  starterCode?: string;
  tags?: string[];
  options?: string[];
  correctOption?: number;
  expectedAnswer?: string | number;
  explanation?: string;
};

const judgeQuestionIds = new Set([
  "python-basic-001", "python-medium-001", "numpy-basic-001", "pandas-basic-001",
  "pandas-medium-001", "linear-basic-001", "logistic-basic-001", "tree-basic-001",
  "rf-basic-001", "knn-basic-001", "svm-basic-001", "kmeans-basic-001",
  "metrics-basic-001", "preprocess-basic-001", "curated-numpy-001", "curated-pandas-001",
  "curated-sklearn-001", "curated-matplotlib-001", "curated-seaborn-001",
  "python-advanced-001", "statistics-medium-001", "numpy-medium-001",
  "numpy-advanced-001", "pandas-advanced-001", "linear-medium-001", "poly-medium-001",
]);

const qualityOverrides: Record<string, Partial<PracticeQuestion>> = {
  "mle-advanced-002": {
    title: "Diagnose concept drift in production",
    question: "A deployed model’s input distribution appears stable, but its performance falls once delayed labels arrive. Explain why this can indicate concept drift, and describe one check you would use to confirm it.",
    expectedAnswer: "Concept drift is a change in the relationship between inputs and the target, so performance can decline even when the input distribution is stable. Compare recent labelled performance with a meaningful baseline and investigate changes in error patterns, calibration, or the conditional relationship between features and labels."
  }
};

const questions = questionBank as PracticeQuestion[];

function normalisePracticeQuestion(question: PracticeQuestion): PracticeQuestion {
  const normalised = { ...question, ...(qualityOverrides[question.id] ?? {}) };
  const isIncompleteCodePrompt =
    (normalised.type === "Coding" || normalised.type === "Debugging") &&
    !normalised.starterCode?.trim();
  // A question without an editor scaffold is not a coding task. It remains a
  // useful learning prompt, but it belongs in the teacher-reviewed section.
  return isIncompleteCodePrompt ? { ...normalised, type: "Concept" } : normalised;
}

export function getPracticeQuestion(id: string) {
  const question = questions.find((item) => item.id === id);
  return question ? normalisePracticeQuestion(question) : null;
}

export function gradingModeFor(question: PracticeQuestion): PracticeGradingMode {
  const normalised = normalisePracticeQuestion(question);
  if (normalised.type === "Coding" || normalised.type === "Debugging") return "code";
  // A prose reference answer is a teaching aid, not an exact-match key: two
  // students can explain the same concept correctly in different words.
  // Reserve automatic exact grading for unambiguous MCQs and numeric answers.
  if (normalised.options?.length || typeof normalised.expectedAnswer === "number") return "exact";
  return "ai";
}

export function hasJudgeTests(questionId: string) {
  // The old question list named a subset as testable, but this project does
  // not yet run untrusted learner code inside an isolated evaluator. Showing a
  // hidden-test badge would be misleading, so all coding tasks are honestly
  // presented as AI-reviewed until that runner exists.
  void questionId;
  void judgeQuestionIds;
  return false;
}

export function publicPracticeQuestion(question: PracticeQuestion) {
  const normalised = normalisePracticeQuestion(question);
  return {
    id: normalised.id,
    topic: normalised.topic,
    level: normalised.level,
    type: normalised.type,
    title: normalised.title,
    question: normalised.question,
    ...(normalised.starterCode ? { starterCode: normalised.starterCode } : {}),
    ...(normalised.tags ? { tags: normalised.tags } : {}),
    ...(normalised.options ? { options: normalised.options } : {}),
    gradingMode: gradingModeFor(normalised),
    testsAvailable: hasJudgeTests(normalised.id),
  };
}

export function allPublicPracticeQuestions() {
  return questions.map(publicPracticeQuestion);
}
