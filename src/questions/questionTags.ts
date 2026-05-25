// src/questions/questionTags.ts
// Phase Q7: tag diversity helpers.
// These helpers keep sessions from feeling repetitive by reducing repeated
// topics/franchises inside one match while still allowing fallback when pools are small.

import type { NormalizedQuestion } from "./types";

export type TagDiversityContext = {
  usedTags?: Set<string>;
  usedTagCounts?: Map<string, number>;
};

export type TagDiversityScore = {
  overlapCount: number;
  repeatedTagCount: number;
  uniqueNewTagCount: number;
  score: number;
};

export function normalizeQuestionTag(tag: unknown) {
  return String(tag ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_+/g, "-");
}

export function getNormalizedQuestionTags(question: Pick<NormalizedQuestion, "tags">) {
  return Array.from(
    new Set((question.tags ?? []).map(normalizeQuestionTag).filter(Boolean))
  );
}

export function calculateTagDiversityScore(
  question: Pick<NormalizedQuestion, "tags">,
  context: TagDiversityContext = {}
): TagDiversityScore {
  const usedTags = context.usedTags ?? new Set<string>();
  const usedTagCounts = context.usedTagCounts ?? new Map<string, number>();
  const tags = getNormalizedQuestionTags(question);

  if (!tags.length) {
    return {
      overlapCount: 0,
      repeatedTagCount: 0,
      uniqueNewTagCount: 0,
      score: 0.4,
    };
  }

  let overlapCount = 0;
  let repeatedTagCount = 0;
  let uniqueNewTagCount = 0;

  for (const tag of tags) {
    const count = usedTagCounts.get(tag) ?? (usedTags.has(tag) ? 1 : 0);

    if (count > 0) {
      overlapCount += 1;
      repeatedTagCount += count;
    } else {
      uniqueNewTagCount += 1;
    }
  }

  // Positive for new topic coverage, increasingly negative for repeated topics.
  const score = uniqueNewTagCount * 0.9 - overlapCount * 1.75 - repeatedTagCount * 0.65;

  return {
    overlapCount,
    repeatedTagCount,
    uniqueNewTagCount,
    score,
  };
}

export function addQuestionTagsToUsage(
  question: Pick<NormalizedQuestion, "tags">,
  usedTags: Set<string>,
  usedTagCounts: Map<string, number>
) {
  for (const tag of getNormalizedQuestionTags(question)) {
    usedTags.add(tag);
    usedTagCounts.set(tag, (usedTagCounts.get(tag) ?? 0) + 1);
  }
}

export function getSessionTagSummary(questions: Array<Pick<NormalizedQuestion, "tags">>) {
  const counts = new Map<string, number>();

  for (const question of questions) {
    for (const tag of getNormalizedQuestionTags(question)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  const repeatedTags = Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

  return {
    uniqueTagCount: counts.size,
    repeatedTags,
  };
}


