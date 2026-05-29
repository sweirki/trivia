// src/questions/gameplayQuestions.ts
// Phase Q10: gameplay-mode adapters for the intelligent question engine.
// Keeps Arena/Tournament/Power legacy screen shapes on the Q-engine.

import {
  buildQuestionSession,
  getQuestionCountForSessionMode,
  type QuestionSessionMode,
} from "./questionSession";
import type { Difficulty, NormalizedQuestion } from "./types";

export type GameplayQuestion = {
  id: number | string;
  text: string;
  question: string;
  answers: string[];
  options: string[];
  correctAnswer: string;
  correctAnswerIndex: number;
  correct: string;
  difficulty: Difficulty;
  category: string;
  premium: boolean;
  tags: string[];
};

export type GameplayQuestionOptions = {
  mode?: QuestionSessionMode;
  category?: string | null;
  categories?: string[];
  count?: number;
  allowPremium?: boolean;
  seed?: string | number;
  excludeQuestionIds?: Array<string | number>;
  preferredDifficulty?: Difficulty;
};

const ARENA_RECENT_LIMIT = 80;
const recentArenaQuestionIdsByMode: Partial<
  Record<Extract<QuestionSessionMode, "ranked" | "survival" | "tournament"> | "power", Array<string | number>>
> = {};

function createSessionSeed(label: string) {
  return `${label}:${Date.now()}:${Math.random().toString(36).slice(2)}:${typeof performance !== "undefined" ? performance.now() : 0}`;
}

function rememberArenaQuestions(
  mode: Extract<QuestionSessionMode, "ranked" | "survival" | "tournament"> | "power",
  questions: GameplayQuestion[]
) {
  const previous = recentArenaQuestionIdsByMode[mode] ?? [];
  const next = [
    ...questions.map((question) => question.id),
    ...previous,
  ];

  recentArenaQuestionIdsByMode[mode] = Array.from(new Set(next)).slice(0, ARENA_RECENT_LIMIT);
}

function getRecentArenaQuestionIds(
  mode: Extract<QuestionSessionMode, "ranked" | "survival" | "tournament"> | "power"
) {
  return recentArenaQuestionIdsByMode[mode] ?? [];
}


function toGameplayQuestion(question: NormalizedQuestion): GameplayQuestion {
  return {
    id: question.id,
    text: question.text,
    question: question.text,
    answers: question.answers,
    options: question.answers,
    correctAnswer: question.correctAnswer,
    correctAnswerIndex: question.correctAnswerIndex,
    correct: question.correctAnswer,
    difficulty: question.difficulty,
    category: question.category,
    premium: question.premium,
    tags: question.tags,
  };
}

function defaultCountForMode(mode: QuestionSessionMode) {
  const count = getQuestionCountForSessionMode(mode);

  if (count > 0) return count;
  if (mode === "survival") return 25;
  if (mode === "timed60") return 10;
  if (mode === "timed90") return 12;
  if (mode === "sudden") return 20;

  return 10;
}

export function buildGameplayQuestions(
  options: GameplayQuestionOptions = {}
): GameplayQuestion[] {
  const mode = options.mode ?? "classic";
  const count = Math.max(0, options.count ?? defaultCountForMode(mode));

  if (count <= 0) return [];

  return buildQuestionSession({
    mode,
    category: options.category,
    categories: options.categories,
    count,
    allowPremium: options.allowPremium,
    seed: options.seed,
    excludeQuestionIds: options.excludeQuestionIds,
    preferredDifficulty: options.preferredDifficulty,
  }).questions.map(toGameplayQuestion);
}

export function buildArenaQuestions(
  mode: Extract<QuestionSessionMode, "ranked" | "survival" | "tournament">,
  count = mode === "survival" ? 25 : 5
): GameplayQuestion[] {
  const recentIds = getRecentArenaQuestionIds(mode);
  const seed = createSessionSeed(`arena:${mode}`);

  let questions = buildGameplayQuestions({
    mode,
    count,
    allowPremium: false,
    seed,
    excludeQuestionIds: recentIds,
  });

  // If every available question was excluded because the player has played many
  // matches in a row, retry without the recent-id exclusion. This keeps the mode
  // playable while still strongly reducing immediate repeats.
  if (questions.length < count) {
    questions = buildGameplayQuestions({
      mode,
      count,
      allowPremium: false,
      seed: createSessionSeed(`arena:${mode}:retry`),
    });
  }

  // Last resort: do not fall back to hardcoded placeholder questions. Use the
  // real question pool even if the free/premium flagging is wrong in packaged
  // data, otherwise ranked can repeat the same five fallback questions forever.
  if (questions.length < count) {
    questions = buildGameplayQuestions({
      mode,
      count,
      allowPremium: true,
      seed: createSessionSeed(`arena:${mode}:all-access`),
      excludeQuestionIds: recentIds,
    });
  }

  rememberArenaQuestions(mode, questions);
  return questions;
}

export function buildPowerArenaQuestions(count = 5): GameplayQuestion[] {
  const recentIds = getRecentArenaQuestionIds("power");
  const seed = createSessionSeed("arena:power");

  let questions = buildGameplayQuestions({
    mode: "ranked",
    count,
    allowPremium: false,
    seed,
    excludeQuestionIds: recentIds,
  });

  if (questions.length < count) {
    questions = buildGameplayQuestions({
      mode: "ranked",
      count,
      allowPremium: false,
      seed: createSessionSeed("arena:power:retry"),
    });
  }

  if (questions.length < count) {
    questions = buildGameplayQuestions({
      mode: "ranked",
      count,
      allowPremium: true,
      seed: createSessionSeed("arena:power:all-access"),
      excludeQuestionIds: recentIds,
    });
  }

  rememberArenaQuestions("power", questions);
  return questions;
}


