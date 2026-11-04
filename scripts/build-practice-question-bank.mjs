#!/usr/bin/env node

/**
 * Build the browser-safe Practice Studio question file from the private bank.
 *
 * The private bank may include answer keys and teacher references. This script
 * is deliberately the only place that exports data for the browser: answer
 * keys never leave the server, and a question is never labelled as an exact or
 * hidden-test exercise unless the product can actually verify it that way.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const privatePath = resolve(root, 'modelmind-source/data/modelmind-practice-private.json');
const publicPath = resolve(root, 'modelmind-source/public/modelmind-practice-questions.json');
const importPaths = [
  'public/modelmind-expanded-curriculum.json',
  'public/modelmind-practice-additions-v3.json',
  'public/modelmind-practice-additions-v5.json'
];

const CODE_TYPES = new Set(['Coding', 'Debugging']);
const QUALITY_OVERRIDES = {
  'mle-advanced-002': {
    title: 'Diagnose concept drift in production',
    question: 'A deployed model’s input distribution appears stable, but its performance falls once delayed labels arrive. Explain why this can indicate concept drift, and describe one check you would use to confirm it.',
    expectedAnswer: 'Concept drift is a change in the relationship between inputs and the target, so performance can decline even when the input distribution is stable. Compare recent labelled performance with a meaningful baseline and investigate changes in error patterns, calibration, or the conditional relationship between features and labels.'
  },
  'stats-advanced-004': {
    expectedAnswer: 0.6666666667
  },
  'stats-advanced-010': {
    type: 'Concept',
    explanation: 'A negative covariance means the variables tend to move in opposite directions in the observed data. Its magnitude depends on the variables’ scales.'
  },
  'imbalance-advanced-004': {
    expectedAnswer: 0.6153846154
  }
};

function normaliseQuestion(source) {
  const question = { ...source, ...(QUALITY_OVERRIDES[source.id] ?? {}) };
  const hasStarter = typeof question.starterCode === 'string' && question.starterCode.trim().length > 0;
  const wasIncompleteCodeExercise = CODE_TYPES.has(question.type) && !hasStarter;

  // These are open-response prompts (for example, "Which splitter...?") that
  // were previously put in the coding section with no editor scaffold. Keep
  // them, but present them honestly as teacher-reviewed concept questions.
  if (wasIncompleteCodeExercise) question.type = 'Concept';

  const hasOptions = Array.isArray(question.options) && Number.isInteger(question.correctOption);
  const hasNumericAnswer = typeof question.expectedAnswer === 'number';
  const gradingMode = CODE_TYPES.has(question.type)
    ? 'code'
    : hasOptions || hasNumericAnswer
      ? 'exact'
      : 'ai';

  return {
    id: question.id,
    topic: question.topic,
    level: question.level,
    type: question.type,
    title: question.title,
    question: question.question,
    ...(hasStarter ? { starterCode: question.starterCode } : {}),
    ...(Array.isArray(question.tags) ? { tags: question.tags } : {}),
    ...(hasOptions ? { options: question.options } : {}),
    gradingMode,
    // No arbitrary learner code is executed by this release. Do not promise
    // hidden tests until an isolated runner has been added and verified.
    testsAvailable: false
  };
}

function titleCaseType(value) {
  const type = String(value ?? '').trim().toLowerCase();
  if (type === 'coding') return 'Coding';
  if (type === 'debugging') return 'Debugging';
  if (type === 'numerical' || type === 'mathematics') return 'Mathematics';
  if (type === 'mcq' || type === 'output prediction') return 'Concept';
  return 'Concept';
}

function starterForImportedCoding(question) {
  const title = String(question.title ?? 'this exercise').replace(/\s+/g, ' ').trim();
  return `# ${title}\n# Write your solution below. Follow the input/output contract in the prompt.\n`;
}

function importQuestion(source, sourceFile) {
  const type = titleCaseType(source.type);
  const mode = String(source.practiceMode ?? '').toLowerCase();
  const isCoding = type === 'Coding' || type === 'Debugging' || mode === 'coding';
  const rawAnswer = source.answer;
  const numericAnswer = typeof rawAnswer === 'number' && Number.isFinite(rawAnswer);
  const correctOption = Number.isInteger(source.correctIndex)
    ? source.correctIndex
    : Number.isInteger(source.correctOption)
      ? source.correctOption
      : undefined;

  return {
    id: String(source.id),
    topic: String(source.topic).trim(),
    level: ['Basic', 'Medium', 'Advanced'].includes(source.level) ? source.level : 'Medium',
    type: isCoding ? 'Coding' : type,
    title: String(source.title).trim(),
    question: String(source.question).trim(),
    ...(isCoding ? { starterCode: starterForImportedCoding(source) } : {}),
    ...(Array.isArray(source.options) ? { options: source.options.map(String) } : {}),
    ...(correctOption !== undefined ? { correctOption } : {}),
    ...(numericAnswer ? { expectedAnswer: rawAnswer } : {}),
    ...(typeof source.explanation === 'string' ? { explanation: source.explanation.trim() } : {}),
    ...(Array.isArray(source.tags) ? { tags: source.tags.map(String) } : {}),
    // Retained only in the private bank for provenance and QA. It is not sent
    // to the browser and does not imply that learner code is executed.
    importSource: sourceFile
  };
}

async function loadImportQuestions(sourceDirectory) {
  const imported = [];
  for (const relativePath of importPaths) {
    const path = resolve(sourceDirectory, relativePath);
    const payload = JSON.parse(await readFile(path, 'utf8'));
    if (!Array.isArray(payload)) throw new Error(`Import file is not an array: ${path}`);
    imported.push(...payload.map(question => importQuestion(question, relativePath)));
  }
  return imported;
}

let privateQuestions = JSON.parse(await readFile(privatePath, 'utf8'));
if (!Array.isArray(privateQuestions)) throw new Error('Practice bank must be an array.');
privateQuestions = privateQuestions.map(question => ({
  ...question,
  ...(QUALITY_OVERRIDES[question?.id] ?? {})
}));

const importIndex = process.argv.indexOf('--import-directory');
if (importIndex !== -1) {
  const sourceDirectory = process.argv[importIndex + 1];
  if (!sourceDirectory) throw new Error('Pass a source directory after --import-directory.');
  const imported = await loadImportQuestions(sourceDirectory);
  const existingIds = new Set(privateQuestions.map(question => question?.id));
  const additions = imported.filter(question => !existingIds.has(question.id));
  privateQuestions = [...privateQuestions, ...additions];
  await writeFile(privatePath, `${JSON.stringify(privateQuestions, null, 2)}\n`, 'utf8');
  console.log(`Imported ${additions.length} new questions from ${sourceDirectory}.`);
}

// Keep the private source of truth corrected as well as the browser export.
// This is intentionally written after any import so a later rebuild is stable.
await writeFile(privatePath, `${JSON.stringify(privateQuestions, null, 2)}\n`, 'utf8');

const ids = new Set();
for (const question of privateQuestions) {
  if (!question?.id || !question.topic || !question.level || !question.type || !question.title || !question.question) {
    throw new Error(`Question is missing required text: ${JSON.stringify(question?.id ?? question)}`);
  }
  if (ids.has(question.id)) throw new Error(`Duplicate practice question id: ${question.id}`);
  ids.add(question.id);
}

const publicQuestions = privateQuestions.map(normaliseQuestion);
await writeFile(publicPath, `${JSON.stringify(publicQuestions, null, 2)}\n`, 'utf8');

const byMode = publicQuestions.reduce((totals, question) => {
  totals[question.gradingMode] += 1;
  return totals;
}, { code: 0, ai: 0, exact: 0 });
console.log(`Built ${publicQuestions.length} public practice questions: ${byMode.code} coding, ${byMode.ai} AI review, ${byMode.exact} exact.`);
