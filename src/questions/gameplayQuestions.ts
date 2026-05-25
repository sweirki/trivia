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
  return buildGameplayQuestions({
    mode,
    count,
    allowPremium: false,
    seed: `arena:${mode}:${Date.now()}`,
  });
}

export function buildPowerArenaQuestions(count = 5): GameplayQuestion[] {
  return buildGameplayQuestions({
    mode: "ranked",
    count,
    allowPremium: false,
    seed: `arena:power:${Date.now()}`,
  });
}


