// src/questions/questionAnalytics.ts
// Phase Q8: question analytics + balancing helpers.
// This records lightweight local quality signals without changing rewards,
// persistence boundaries, or gameplay outcomes.

import type { Difficulty } from "./types";
import type { QuestionSessionMode } from "./questionSession";

export type QuestionAnalyticsResult = {
  questionId: string | number;
  difficulty: Difficulty;
  correct: boolean;
  category?: string | null;
  mode?: QuestionSessionMode | string | null;
  answeredAt?: number;
  answerTimeMs?: number | null;
};

export type QuestionAnalyticsBucket = {
  attempts: number;
  correct: number;
  wrong: number;
  accuracy: number;
  averageAnswerTimeMs: number | null;
};

export type QuestionQualitySignal =
  | "needs_review"
  | "too_easy"
  | "too_hard"
  | "healthy";

export type QuestionAnalyticsItem = QuestionAnalyticsBucket & {
  id: string;
  category: string | null;
  difficulty: Difficulty;
  lastAnsweredAt: number;
  signal: QuestionQualitySignal;
};

export type QuestionAnalyticsState = {
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  rollingAccuracy: number;
  averageAnswerTimeMs: number | null;
  byDifficulty: Record<Difficulty, QuestionAnalyticsBucket>;
  byCategory: Record<string, QuestionAnalyticsBucket>;
  byQuestion: Record<string, QuestionAnalyticsItem>;
  recentResults: QuestionAnalyticsResult[];
  flaggedQuestionIds: string[];
  updatedAt: number | null;
};

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert"];
const MAX_RECENT_RESULTS = 120;
const MAX_QUESTION_ITEMS = 500;
const MAX_CATEGORY_BUCKETS = 80;
const MIN_QUALITY_ATTEMPTS = 3;

export const EMPTY_ANALYTICS_BUCKET: QuestionAnalyticsBucket = {
  attempts: 0,
  correct: 0,
  wrong: 0,
  accuracy: 0,
  averageAnswerTimeMs: null,
};

function normalizeId(id: string | number | null | undefined) {
  const value = String(id ?? "").trim();
  return value.length ? value : null;
}

function normalizeDifficulty(value: unknown): Difficulty {
  return value === "medium" || value === "hard" || value === "expert" ? value : "easy";
}

function normalizeCategory(value: unknown) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_+/g, "-");

  return normalized.length ? normalized : "unknown";
}

function normalizeAnswerTime(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
  return Math.round(value);
}

function createDifficultyBuckets(): Record<Difficulty, QuestionAnalyticsBucket> {
  return {
    easy: { ...EMPTY_ANALYTICS_BUCKET },
    medium: { ...EMPTY_ANALYTICS_BUCKET },
    hard: { ...EMPTY_ANALYTICS_BUCKET },
    expert: { ...EMPTY_ANALYTICS_BUCKET },
  };
}

function normalizeBucket(value: Partial<QuestionAnalyticsBucket> | null | undefined): QuestionAnalyticsBucket {
  const attempts = Math.max(0, Math.floor(value?.attempts ?? 0));
  const correct = Math.max(0, Math.floor(value?.correct ?? 0));
  const wrong = Math.max(0, Math.floor(value?.wrong ?? Math.max(0, attempts - correct)));
  const total = Math.max(attempts, correct + wrong);
  const safeCorrect = Math.min(correct, total);
  const safeWrong = Math.max(0, total - safeCorrect);
  const averageAnswerTimeMs = normalizeAnswerTime(value?.averageAnswerTimeMs);

  return {
    attempts: total,
    correct: safeCorrect,
    wrong: safeWrong,
    accuracy: total === 0 ? 0 : Math.round((safeCorrect / total) * 100),
    averageAnswerTimeMs,
  };
}

function addToBucket(
  bucket: QuestionAnalyticsBucket,
  result: Pick<QuestionAnalyticsResult, "correct" | "answerTimeMs">
): QuestionAnalyticsBucket {
  const attempts = bucket.attempts + 1;
  const correct = bucket.correct + (result.correct ? 1 : 0);
  const wrong = attempts - correct;
  const answerTimeMs = normalizeAnswerTime(result.answerTimeMs);

  let averageAnswerTimeMs = bucket.averageAnswerTimeMs;

  if (answerTimeMs !== null) {
    if (averageAnswerTimeMs === null || bucket.attempts === 0) {
      averageAnswerTimeMs = answerTimeMs;
    } else {
      averageAnswerTimeMs = Math.round(
        (averageAnswerTimeMs * bucket.attempts + answerTimeMs) / attempts
      );
    }
  }

  return {
    attempts,
    correct,
    wrong,
    accuracy: Math.round((correct / attempts) * 100),
    averageAnswerTimeMs,
  };
}

export const DEFAULT_QUESTION_ANALYTICS_STATE: QuestionAnalyticsState = {
  totalAnswered: 0,
  totalCorrect: 0,
  totalWrong: 0,
  rollingAccuracy: 0,
  averageAnswerTimeMs: null,
  byDifficulty: createDifficultyBuckets(),
  byCategory: {},
  byQuestion: {},
  recentResults: [],
  flaggedQuestionIds: [],
  updatedAt: null,
};

function getQuestionQualitySignal(bucket: QuestionAnalyticsBucket): QuestionQualitySignal {
  if (bucket.attempts < MIN_QUALITY_ATTEMPTS) return "healthy";

  if (bucket.accuracy <= 25) return "too_hard";
  if (bucket.accuracy >= 95) return "too_easy";
  if (bucket.accuracy <= 35 || bucket.accuracy >= 90) return "needs_review";

  return "healthy";
}

function isQuestionAnalyticsResult(
  result: QuestionAnalyticsResult | null,
): result is QuestionAnalyticsResult {
  return result !== null;
}

export function normalizeQuestionAnalyticsState(
  value: Partial<QuestionAnalyticsState> | null | undefined
): QuestionAnalyticsState {
  const byDifficulty = createDifficultyBuckets();

  for (const difficulty of DIFFICULTIES) {
    byDifficulty[difficulty] = normalizeBucket(value?.byDifficulty?.[difficulty]);
  }

  const byCategory: Record<string, QuestionAnalyticsBucket> = {};
  const categoryEntries = Object.entries(value?.byCategory ?? {}).slice(-MAX_CATEGORY_BUCKETS);

  for (const [category, bucket] of categoryEntries) {
    byCategory[normalizeCategory(category)] = normalizeBucket(bucket);
  }

  const byQuestion: Record<string, QuestionAnalyticsItem> = {};
  const questionEntries = Object.entries(value?.byQuestion ?? {}).slice(-MAX_QUESTION_ITEMS);

  const recentResults: QuestionAnalyticsResult[] = Array.isArray(value?.recentResults)
  ? value.recentResults
      .flatMap((result): QuestionAnalyticsResult[] => {
        const questionId = normalizeId(result.questionId);
        if (!questionId) return [];

        return [
          {
            questionId,
            difficulty: normalizeDifficulty(result.difficulty),
            correct: result.correct === true,
            category: normalizeCategory(result.category),
            mode: typeof result.mode === "string" ? result.mode : null,
            answeredAt:
              typeof result.answeredAt === "number"
                ? result.answeredAt
                : Date.now(),
            answerTimeMs: normalizeAnswerTime(result.answerTimeMs),
          },
        ];
      })
      .slice(-MAX_RECENT_RESULTS)
  : [];

  for (const [id, item] of questionEntries) {
    const safeId = normalizeId(id);
    if (!safeId) continue;

    const bucket = normalizeBucket(item);
    const difficulty = normalizeDifficulty(item?.difficulty);
    const signal = getQuestionQualitySignal(bucket);

    byQuestion[safeId] = {
      id: safeId,
      category: typeof item?.category === "string" ? normalizeCategory(item.category) : null,
      difficulty,
      lastAnsweredAt: typeof item?.lastAnsweredAt === "number" ? item.lastAnsweredAt : Date.now(),
      ...bucket,
      signal,
    };
  }

  const totalAnswered =
    typeof value?.totalAnswered === "number"
      ? Math.max(0, Math.floor(value.totalAnswered))
      : recentResults.length;
  const totalCorrect =
    typeof value?.totalCorrect === "number"
      ? Math.max(0, Math.floor(value.totalCorrect))
      : recentResults.filter((result) => result.correct).length;
  const totalWrong =
    typeof value?.totalWrong === "number"
      ? Math.max(0, Math.floor(value.totalWrong))
      : Math.max(0, totalAnswered - totalCorrect);

  const flaggedQuestionIds = Object.values(byQuestion)
    .filter((item) => item.signal !== "healthy")
    .map((item) => item.id)
    .slice(0, 100);

  return {
    totalAnswered,
    totalCorrect,
    totalWrong,
    rollingAccuracy: totalAnswered === 0 ? 0 : Math.round((totalCorrect / totalAnswered) * 100),
    averageAnswerTimeMs: normalizeAnswerTime(value?.averageAnswerTimeMs),
    byDifficulty,
    byCategory,
    byQuestion,
    recentResults,
    flaggedQuestionIds,
    updatedAt: typeof value?.updatedAt === "number" ? value.updatedAt : null,
  };
}

export function recordQuestionAnalyticsResult(
  state: QuestionAnalyticsState | Partial<QuestionAnalyticsState> | null | undefined,
  input: QuestionAnalyticsResult
): QuestionAnalyticsState {
  const current = normalizeQuestionAnalyticsState(state);
  const questionId = normalizeId(input.questionId);

  if (!questionId) return current;

  const result: QuestionAnalyticsResult = {
    questionId,
    difficulty: normalizeDifficulty(input.difficulty),
    correct: input.correct === true,
    category: normalizeCategory(input.category),
    mode: typeof input.mode === "string" ? input.mode : null,
    answeredAt: typeof input.answeredAt === "number" ? input.answeredAt : Date.now(),
    answerTimeMs: normalizeAnswerTime(input.answerTimeMs),
  };

  const totalAnswered = current.totalAnswered + 1;
  const totalCorrect = current.totalCorrect + (result.correct ? 1 : 0);
  const totalWrong = totalAnswered - totalCorrect;

  const byDifficulty = {
    ...current.byDifficulty,
    [result.difficulty]: addToBucket(current.byDifficulty[result.difficulty], result),
  };

  const categoryKey = normalizeCategory(result.category);
  const byCategory = {
    ...current.byCategory,
    [categoryKey]: addToBucket(current.byCategory[categoryKey] ?? EMPTY_ANALYTICS_BUCKET, result),
  };

  const previousQuestion = current.byQuestion[questionId];
  const questionBucket = addToBucket(previousQuestion ?? EMPTY_ANALYTICS_BUCKET, result);
  const questionSignal = getQuestionQualitySignal(questionBucket);
  const byQuestion = {
    ...current.byQuestion,
    [questionId]: {
      id: questionId,
      category: categoryKey,
      difficulty: result.difficulty,
      lastAnsweredAt: result.answeredAt ?? Date.now(),
      ...questionBucket,
      signal: questionSignal,
    },
  };

  const trimmedQuestions = Object.fromEntries(
    Object.values(byQuestion)
      .sort((a, b) => b.lastAnsweredAt - a.lastAnsweredAt)
      .slice(0, MAX_QUESTION_ITEMS)
      .map((item) => [item.id, item])
  );


  const recentResults = [...current.recentResults, result].slice(-MAX_RECENT_RESULTS);
  const answerTimeMs = normalizeAnswerTime(result.answerTimeMs);
  let averageAnswerTimeMs = current.averageAnswerTimeMs;

  if (answerTimeMs !== null) {
    if (averageAnswerTimeMs === null || current.totalAnswered === 0) {
      averageAnswerTimeMs = answerTimeMs;
    } else {
      averageAnswerTimeMs = Math.round(
        (averageAnswerTimeMs * current.totalAnswered + answerTimeMs) / totalAnswered
      );
    }
  }

  const flaggedQuestionIds = Object.values(trimmedQuestions)
    .filter((item) => item.signal !== "healthy")
    .map((item) => item.id)
    .slice(0, 100);

  return {
    totalAnswered,
    totalCorrect,
    totalWrong,
    rollingAccuracy: Math.round((totalCorrect / totalAnswered) * 100),
    averageAnswerTimeMs,
    byDifficulty,
    byCategory,
    byQuestion: trimmedQuestions,
    recentResults,
    flaggedQuestionIds,
    updatedAt: result.answeredAt ?? Date.now(),
  };
}

export function getQuestionAnalyticsSummary(state: QuestionAnalyticsState | Partial<QuestionAnalyticsState>) {
  
  const normalized = normalizeQuestionAnalyticsState(state);

  return {
    totalAnswered: normalized.totalAnswered,
    rollingAccuracy: normalized.rollingAccuracy,
    averageAnswerTimeMs: normalized.averageAnswerTimeMs,
    flaggedQuestionCount: normalized.flaggedQuestionIds.length,
    strongestDifficulty: DIFFICULTIES.reduce<Difficulty>((best, difficulty) => {
      const bucket = normalized.byDifficulty[difficulty];
      const bestBucket = normalized.byDifficulty[best];

      if (bucket.attempts < 3) return best;
      if (bestBucket.attempts < 3) return difficulty;

      return bucket.accuracy > bestBucket.accuracy ? difficulty : best;
    }, "easy"),
  };
}
