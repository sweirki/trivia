// src/questions/adaptiveDifficulty.ts
// Phase Q6: adaptive difficulty helpers.
// This keeps difficulty personalization small, deterministic, and safe. It does
// not change rewards or progression; it only recommends a session difficulty.

import type { Difficulty } from "./types";
import type { QuestionSessionMode } from "./questionSession";

export type AdaptiveQuestionResult = {
  questionId: string | number;
  difficulty: Difficulty;
  correct: boolean;
  category?: string | null;
  mode?: QuestionSessionMode | string | null;
  answeredAt?: number;
};

export type AdaptiveDifficultyState = {
  recentAnswers: AdaptiveQuestionResult[];
  rollingAccuracy: number;
  preferredDifficulty: Difficulty;
  confidence: number;
  updatedAt: number | null;
};

export const DEFAULT_ADAPTIVE_DIFFICULTY_STATE: AdaptiveDifficultyState = {
  recentAnswers: [],
  rollingAccuracy: 0,
  preferredDifficulty: "easy",
  confidence: 0,
  updatedAt: null,
};

const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard", "expert"];
const MAX_RECENT_ANSWERS = 80;
const MIN_CONFIDENT_SAMPLE_SIZE = 8;

function difficultyIndex(difficulty: Difficulty) {
  const index = DIFFICULTY_ORDER.indexOf(difficulty);
  return index >= 0 ? index : 0;
}

function clampDifficultyIndex(index: number) {
  return Math.max(0, Math.min(DIFFICULTY_ORDER.length - 1, index));
}

function normalizeDifficulty(value: unknown): Difficulty {
  return value === "medium" || value === "hard" || value === "expert" ? value : "easy";
}

export function normalizeAdaptiveDifficultyState(
  value: Partial<AdaptiveDifficultyState> | null | undefined
): AdaptiveDifficultyState {
  const recentAnswers = Array.isArray(value?.recentAnswers)
    ? value.recentAnswers
        .filter((answer) => answer && answer.questionId !== undefined)
        .map((answer) => ({
          questionId: answer.questionId,
          difficulty: normalizeDifficulty(answer.difficulty),
          correct: answer.correct === true,
          category: typeof answer.category === "string" ? answer.category : null,
          mode: typeof answer.mode === "string" ? answer.mode : null,
          answeredAt: typeof answer.answeredAt === "number" ? answer.answeredAt : Date.now(),
        }))
        .slice(-MAX_RECENT_ANSWERS)
    : [];

  const computed = calculateAdaptiveDifficulty(recentAnswers);

  return {
    recentAnswers,
    rollingAccuracy:
      typeof value?.rollingAccuracy === "number" && Number.isFinite(value.rollingAccuracy)
        ? Math.max(0, Math.min(100, Math.round(value.rollingAccuracy)))
        : computed.rollingAccuracy,
    preferredDifficulty: normalizeDifficulty(value?.preferredDifficulty ?? computed.preferredDifficulty),
    confidence:
      typeof value?.confidence === "number" && Number.isFinite(value.confidence)
        ? Math.max(0, Math.min(1, value.confidence))
        : computed.confidence,
    updatedAt: typeof value?.updatedAt === "number" ? value.updatedAt : computed.updatedAt,
  };
}

export function calculateAdaptiveDifficulty(
  recentAnswers: AdaptiveQuestionResult[]
): Pick<AdaptiveDifficultyState, "rollingAccuracy" | "preferredDifficulty" | "confidence" | "updatedAt"> {
  const normalized = recentAnswers.slice(-MAX_RECENT_ANSWERS);
  const recentWindow = normalized.slice(-24);

  if (!recentWindow.length) {
    return {
      rollingAccuracy: 0,
      preferredDifficulty: "easy",
      confidence: 0,
      updatedAt: null,
    };
  }

  const correctCount = recentWindow.filter((answer) => answer.correct).length;
  const rollingAccuracy = Math.round((correctCount / recentWindow.length) * 100);
  const confidence = Math.min(1, recentWindow.length / MIN_CONFIDENT_SAMPLE_SIZE);

  const averageDifficulty =
    recentWindow.reduce((sum, answer) => sum + difficultyIndex(answer.difficulty), 0) /
    recentWindow.length;

  let targetIndex = Math.round(averageDifficulty);

  // Strong performance should gradually move the player up. Weak performance
  // should protect the player from frustration and move down.
  if (recentWindow.length >= MIN_CONFIDENT_SAMPLE_SIZE) {
    if (rollingAccuracy >= 86) targetIndex += 1;
    else if (rollingAccuracy <= 45) targetIndex -= 1;
  }

  // Very strong expert/hard performance can reach expert; otherwise keep casual
  // sessions between easy/medium/hard.
  if (rollingAccuracy < 92) targetIndex = Math.min(targetIndex, 2);

  return {
    rollingAccuracy,
    preferredDifficulty: DIFFICULTY_ORDER[clampDifficultyIndex(targetIndex)],
    confidence,
    updatedAt: normalized[normalized.length - 1]?.answeredAt ?? Date.now(),
  };
}

export function recordAdaptiveQuestionResult(
  state: AdaptiveDifficultyState | Partial<AdaptiveDifficultyState> | null | undefined,
  result: AdaptiveQuestionResult
): AdaptiveDifficultyState {
  const normalizedState = normalizeAdaptiveDifficultyState(state);
  const nextRecentAnswers = [
    ...normalizedState.recentAnswers,
    {
      ...result,
      difficulty: normalizeDifficulty(result.difficulty),
      correct: result.correct === true,
      answeredAt: result.answeredAt ?? Date.now(),
    },
  ].slice(-MAX_RECENT_ANSWERS);

  const computed = calculateAdaptiveDifficulty(nextRecentAnswers);

  return {
    recentAnswers: nextRecentAnswers,
    rollingAccuracy: computed.rollingAccuracy,
    preferredDifficulty: computed.preferredDifficulty,
    confidence: computed.confidence,
    updatedAt: computed.updatedAt,
  };
}

export function getAdaptivePreferredDifficulty(
  state: AdaptiveDifficultyState | Partial<AdaptiveDifficultyState> | null | undefined,
  mode?: QuestionSessionMode | string | null
): Difficulty {
  const normalizedState = normalizeAdaptiveDifficultyState(state);

  // Keep competitive modes fairer and less volatile. They can use adaptive
  // difficulty later, but Q6 only personalizes casual Quick Play.
  if (mode === "ranked" || mode === "daily" || mode === "tournament") {
    return "medium";
  }

  if (normalizedState.confidence < 0.5) return "easy";

  return normalizedState.preferredDifficulty;
}


