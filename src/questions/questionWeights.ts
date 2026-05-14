// src/questions/questionWeights.ts
// Phase Q5: weighted question selection helpers.
// These helpers keep question choice random, but not chaotic. They prefer
// fresh, on-plan, diverse questions while still allowing variety.

import type { Difficulty, NormalizedQuestion } from "./types";
import { calculateTagDiversityScore } from "./questionTags";

export type QuestionWeightContext = {
  targetDifficulty?: Difficulty;
  usedTags?: Set<string>;
  usedTagCounts?: Map<string, number>;
  usedCategories?: Set<string>;
  excludedQuestionIds?: Set<string>;
  rng?: () => number;
  allowPremium?: boolean;
};

export type WeightedQuestionCandidate = {
  question: NormalizedQuestion;
  weight: number;
  reasons: {
    difficulty: number;
    tagDiversity: number;
    tagOverlap: number;
    categoryDiversity: number;
    premium: number;
    freshness: number;
    jitter: number;
  };
};

const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard", "expert"];

const MIN_WEIGHT = 0.01;

function normalizeId(id: string | number) {
  return String(id);
}

function clampWeight(value: number) {
  if (!Number.isFinite(value)) return MIN_WEIGHT;
  return Math.max(MIN_WEIGHT, value);
}

function getDifficultyDistance(questionDifficulty: Difficulty, targetDifficulty?: Difficulty) {
  if (!targetDifficulty) return 0;

  const questionIndex = DIFFICULTY_ORDER.indexOf(questionDifficulty);
  const targetIndex = DIFFICULTY_ORDER.indexOf(targetDifficulty);

  if (questionIndex < 0 || targetIndex < 0) return 1;

  return Math.abs(questionIndex - targetIndex);
}

export function calculateQuestionWeight(
  question: NormalizedQuestion,
  context: QuestionWeightContext = {}
): WeightedQuestionCandidate {
  const usedTags = context.usedTags ?? new Set<string>();
  const usedCategories = context.usedCategories ?? new Set<string>();
  const excludedQuestionIds = context.excludedQuestionIds ?? new Set<string>();
  const rng = context.rng ?? Math.random;

  if (excludedQuestionIds.has(normalizeId(question.id))) {
    return {
      question,
      weight: 0,
      reasons: {
        difficulty: 0,
        tagDiversity: 0,
        tagOverlap: 0,
        categoryDiversity: 0,
        premium: 0,
        freshness: -10,
        jitter: 0,
      },
    };
  }

  if (context.allowPremium === false && question.premium) {
    return {
      question,
      weight: 0,
      reasons: {
        difficulty: 0,
        tagDiversity: 0,
        tagOverlap: 0,
        categoryDiversity: 0,
        premium: -10,
        freshness: 0,
        jitter: 0,
      },
    };
  }

  const difficultyDistance = getDifficultyDistance(question.difficulty, context.targetDifficulty);
  const difficulty = context.targetDifficulty
    ? Math.max(0, 5 - difficultyDistance * 1.75)
    : 1.5;

  const tagScore = calculateTagDiversityScore(question, {
    usedTags,
    usedTagCounts: context.usedTagCounts,
  });
  const tagDiversity = Math.max(-7, Math.min(3, 1.4 + tagScore.score));
  const tagOverlap = tagScore.overlapCount;

  const categoryDiversity = usedCategories.has(question.category) ? -0.35 : 0.75;

  // Premium should not overpower fairness. This tiny nudge only helps premium
  // questions appear when a player is allowed to access premium pools.
  const premium = question.premium && context.allowPremium !== false ? 0.2 : 0;

  const freshness = 1;
  const jitter = rng() * 0.75;

  const weight = clampWeight(
    1 + difficulty + tagDiversity + categoryDiversity + premium + freshness + jitter
  );

  return {
    question,
    weight,
    reasons: {
      difficulty,
      tagDiversity,
      tagOverlap,
      categoryDiversity,
      premium,
      freshness,
      jitter,
    },
  };
}

export function rankWeightedQuestionCandidates(
  questions: NormalizedQuestion[],
  context: QuestionWeightContext = {}
) {
  return questions
    .map((question) => calculateQuestionWeight(question, context))
    .filter((candidate) => candidate.weight > 0)
    .sort((a, b) => b.weight - a.weight);
}

export function pickWeightedQuestion(
  questions: NormalizedQuestion[],
  context: QuestionWeightContext = {}
) {
  const candidates = rankWeightedQuestionCandidates(questions, context);

  if (!candidates.length) return null;

  const rng = context.rng ?? Math.random;
  const totalWeight = candidates.reduce((sum, candidate) => sum + candidate.weight, 0);

  if (totalWeight <= 0) return candidates[0]?.question ?? null;

  let ticket = rng() * totalWeight;

  for (const candidate of candidates) {
    ticket -= candidate.weight;
    if (ticket <= 0) return candidate.question;
  }

  return candidates[candidates.length - 1]?.question ?? null;
}

export function buildWeightedQuestionOrder(
  questions: NormalizedQuestion[],
  context: QuestionWeightContext = {}
) {
  const remaining = [...questions];
  const ordered: NormalizedQuestion[] = [];
  const usedTags = new Set(context.usedTags ?? []);
  const usedTagCounts = new Map(context.usedTagCounts ?? []);
  const usedCategories = new Set(context.usedCategories ?? []);

  while (remaining.length) {
    const next = pickWeightedQuestion(remaining, {
      ...context,
      usedTags,
      usedTagCounts,
      usedCategories,
    });

    if (!next) break;

    ordered.push(next);
    for (const tag of next.tags) {
      usedTags.add(tag);
      usedTagCounts.set(tag, (usedTagCounts.get(tag) ?? 0) + 1);
    }
    usedCategories.add(next.category);

    const nextId = normalizeId(next.id);
    const index = remaining.findIndex((question) => normalizeId(question.id) === nextId);
    if (index >= 0) remaining.splice(index, 1);
    else break;
  }

  return ordered;
}
