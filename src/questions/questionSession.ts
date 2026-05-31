// src/questions/questionSession.ts
// Phase Q3: curated question session builder.
// This layer turns registry pools into better gameplay sessions by balancing
// difficulty, premium/free access, category mix, and tag diversity.

import type { Difficulty, NormalizedQuestion } from "./types";
import { pickWeightedQuestion } from "./questionWeights";
import {
  getMixedQuestionPool,
  getQuestionsByCategory,
  normalizeCategoryId,
} from "./questionRegistry";
import { addQuestionTagsToUsage, getSessionTagSummary } from "./questionTags";
import { filterPlayableQuestions } from "./questionGuards";

export type QuestionSessionMode =
  | "classic"
  | "speed"
  | "timed60"
  | "timed90"
  | "sudden"
  | "ranked"
  | "survival"
  | "daily"
  | "tournament";

export type QuestionSessionOptions = {
  mode: QuestionSessionMode;
  category?: string | null;
  categories?: string[];
  count: number;
  allowPremium?: boolean;
  seed?: string | number;
  excludeQuestionIds?: Array<string | number>;
  preferredDifficulty?: Difficulty;
};

export type QuestionSessionResult = {
  questions: NormalizedQuestion[];
  requestedCount: number;
  returnedCount: number;
  mode: QuestionSessionMode;
  category?: string;
  difficultyPlan: Difficulty[];
  fallbackUsed: boolean;
  tagSummary: {
    uniqueTagCount: number;
    repeatedTags: Array<{ tag: string; count: number }>;
  };
};

const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard", "expert"];

const MODE_DIFFICULTY_PLANS: Record<QuestionSessionMode, Difficulty[]> = {
  classic: ["easy", "medium", "medium", "medium", "hard", "easy", "medium", "hard", "medium", "expert"],
  speed: ["easy", "easy", "medium", "medium", "medium", "hard", "easy", "medium", "medium", "hard", "medium", "expert", "easy", "medium", "hard"],
  timed60: ["easy", "medium", "medium", "hard", "easy", "medium", "hard", "medium", "expert", "medium"],
  timed90: ["easy", "medium", "medium", "hard", "easy", "medium", "hard", "medium", "expert", "medium", "hard", "expert"],
  sudden: ["easy", "medium", "medium", "hard", "hard", "expert"],
  ranked: ["medium", "medium", "hard", "hard", "expert"],
  survival: ["easy", "medium", "medium", "hard", "hard", "expert"],
  daily: ["easy", "medium", "medium", "hard", "hard", "expert", "medium"],

  // Tournament must feel earned. No easy questions unless the category has
  // no playable medium/hard/expert questions left after filtering.
  tournament: ["hard", "medium", "hard", "expert", "hard", "medium", "hard", "expert", "hard", "expert"],
};

function normalizeId(id: string | number) {
  return String(id);
}

function createRng(seed?: string | number) {
  if (seed === undefined || seed === null || seed === "") return Math.random;

  let value = 2166136261;

  for (const char of String(seed)) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }

  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithRng<T>(items: T[], rng: () => number) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function buildDifficultyPlan(
  mode: QuestionSessionMode,
  count: number,
  preferredDifficulty?: Difficulty
) {
  if (count <= 0) return [];

  if (preferredDifficulty) {
    const preferredIndex = DIFFICULTY_ORDER.indexOf(preferredDifficulty);
    const softer = DIFFICULTY_ORDER[Math.max(0, preferredIndex - 1)] ?? preferredDifficulty;
    const harder = DIFFICULTY_ORDER[Math.min(DIFFICULTY_ORDER.length - 1, preferredIndex + 1)] ?? preferredDifficulty;
    const pattern = [softer, preferredDifficulty, preferredDifficulty, harder];

    return Array.from({ length: count }, (_, index) => pattern[index % pattern.length]);
  }

  const base = MODE_DIFFICULTY_PLANS[mode] ?? MODE_DIFFICULTY_PLANS.classic;

  return Array.from({ length: count }, (_, index) => base[index % base.length]);
}

function getPool(options: QuestionSessionOptions) {
  if (options.categories?.length) return getMixedQuestionPool(options.categories);

  const normalizedCategory = normalizeCategoryId(options.category);
  if (normalizedCategory) return getQuestionsByCategory(normalizedCategory);

  return getMixedQuestionPool();
}


function shuffleQuestionAnswers(
  question: NormalizedQuestion,
  rng: () => number
): NormalizedQuestion {
  if (!question.answers.length) return question;

  const indexedAnswers = question.answers.map((answer, index) => ({
    answer,
    index,
  }));

  const shuffled = shuffleWithRng(indexedAnswers, rng);
  const correctAnswerIndex = shuffled.findIndex(
    (item) => item.answer === question.correctAnswer
  );

  return {
    ...question,
    answers: shuffled.map((item) => item.answer),
    correctAnswerIndex:
      correctAnswerIndex >= 0
        ? correctAnswerIndex
        : question.correctAnswerIndex,
  };
}

export function buildQuestionSession(options: QuestionSessionOptions): QuestionSessionResult {
  const requestedCount = Math.max(0, options.count);
  const rng = createRng(options.seed);
  const excludedIds = new Set((options.excludeQuestionIds ?? []).map(normalizeId));
  const normalizedCategory = normalizeCategoryId(options.category);
  const difficultyPlan = buildDifficultyPlan(
    options.mode,
    requestedCount,
    options.preferredDifficulty
  );

  const basePool = filterPlayableQuestions(getPool(options))
    .filter((question) => options.allowPremium !== false || !question.premium)
    .filter((question) => !excludedIds.has(normalizeId(question.id)));

  const fallbackPool = filterPlayableQuestions(getPool(options)).filter(
    (question) => options.allowPremium !== false || !question.premium
  );

  const normalWorkingPool = basePool.length >= Math.min(requestedCount, 1) ? basePool : fallbackPool;

  // Tournament-specific hard gate: prioritize medium/hard/expert only.
  // If there are enough non-easy questions, easy questions are removed from
  // the available pool entirely so a champion run cannot feel like Quick Play.
  const tournamentHardPool =
    options.mode === "tournament"
      ? normalWorkingPool.filter((question) => question.difficulty !== "easy")
      : normalWorkingPool;

  const workingPool =
    options.mode === "tournament" && tournamentHardPool.length >= Math.min(requestedCount, normalWorkingPool.length)
      ? tournamentHardPool
      : normalWorkingPool;

  const available = shuffleWithRng(workingPool, rng);
  const selected: NormalizedQuestion[] = [];
  const selectedIds = new Set<string>();
  const usedTags = new Set<string>();
  const usedTagCounts = new Map<string, number>();
  const usedCategories = new Set<string>();

  for (const targetDifficulty of difficultyPlan) {
    const unusedCandidates = available.filter(
      (question) => !selectedIds.has(normalizeId(question.id))
    );

    const candidates =
      options.mode === "tournament"
        ? unusedCandidates.filter((question) => question.difficulty === targetDifficulty).length
          ? unusedCandidates.filter((question) => question.difficulty === targetDifficulty)
          : unusedCandidates.filter((question) => question.difficulty !== "easy")
        : unusedCandidates;

    const next = pickWeightedQuestion(candidates, {
      targetDifficulty,
      usedTags,
      usedTagCounts,
      usedCategories,
      rng,
      allowPremium: options.allowPremium,
    });
    if (!next) break;

    selected.push(next);
    selectedIds.add(normalizeId(next.id));
    usedCategories.add(next.category);
    addQuestionTagsToUsage(next, usedTags, usedTagCounts);
  }

  if (selected.length < requestedCount) {
    for (const question of available) {
      if (selected.length >= requestedCount) break;
      if (selectedIds.has(normalizeId(question.id))) continue;

      selected.push(question);
      selectedIds.add(normalizeId(question.id));
    }
  }

  const sessionQuestions = selected
    .slice(0, requestedCount)
    .map((question) => shuffleQuestionAnswers(question, rng));

  return {
    questions: sessionQuestions,
    requestedCount,
    returnedCount: sessionQuestions.length,
    mode: options.mode,
    category: normalizedCategory,
    difficultyPlan,
    fallbackUsed: basePool.length !== workingPool.length,
    tagSummary: getSessionTagSummary(sessionQuestions),
  };
}

export function getQuestionCountForSessionMode(mode: QuestionSessionMode) {
  if (mode === "classic") return 10;
  if (mode === "speed") return 15;
  if (mode === "daily") return 7;
  if (mode === "ranked") return 5;
  if (mode === "tournament") return 5;
  if (mode === "survival") return 25;
  if (mode === "timed60") return 10;
  if (mode === "timed90") return 12;
  if (mode === "sudden") return 20;

  return 0;
}


