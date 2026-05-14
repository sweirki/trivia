// src/questions/questionMemory.ts
// Phase Q4: recent-question memory helpers.
// Keeps recently seen question IDs small, normalized, and safe to persist.

export const MAX_RECENT_QUESTION_IDS = 300;

export type QuestionId = string | number;

export function normalizeQuestionId(id: QuestionId | null | undefined) {
  if (id === null || id === undefined) return null;

  const normalized = String(id).trim();
  return normalized.length ? normalized : null;
}

export function normalizeRecentQuestionIds(
  ids: Array<QuestionId | null | undefined> | null | undefined,
  limit = MAX_RECENT_QUESTION_IDS
) {
  if (!Array.isArray(ids)) return [];

  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const id of ids) {
    const safeId = normalizeQuestionId(id);
    if (!safeId || seen.has(safeId)) continue;

    seen.add(safeId);
    normalized.push(safeId);

    if (normalized.length >= limit) break;
  }

  return normalized;
}

export function mergeRecentQuestionIds(
  currentIds: Array<QuestionId | null | undefined> | null | undefined,
  newIds: Array<QuestionId | null | undefined> | null | undefined,
  limit = MAX_RECENT_QUESTION_IDS
) {
  // New IDs come first so the list is ordered newest → oldest.
  return normalizeRecentQuestionIds([...(newIds ?? []), ...(currentIds ?? [])], limit);
}

export function buildRecentQuestionIdSet(
  ids: Array<QuestionId | null | undefined> | null | undefined
) {
  return new Set(normalizeRecentQuestionIds(ids));
}
