// src/questions/loadCategoryQuestions.ts
import { normalizeQuestions } from './normalizeQuestions';
import { categoryFileMap, CategoryKey } from './categoryFileMap';

function toCategoryKey(category: string): CategoryKey | null {
  const key = String(category || '').trim().toLowerCase();

  // Normalize the incoming category name (UI may have different casing/spaces)
  if (key === 'science') return 'science';
  if (key === 'history') return 'history';
  if (key === 'movies' || key === 'film' || key === 'cinema') return 'movies';
  if (key === 'geography' || key === 'geo') return 'geography';

  // common variants
  if (
    key === 'general knowledge' ||
    key === 'generalknowledge' ||
    key === 'general_knowledge' ||
    key === 'gk'
  ) {
    return 'generalknowledge';
  }

  return null;
}

export function loadCategoryQuestions(category: string) {
  const key = toCategoryKey(category);

  if (!key) {
    throw new Error(
      `[loadCategoryQuestions] Unknown category "${category}". Add it to toCategoryKey() and categoryFileMap.`
    );
  }

  const raw = categoryFileMap[key];

  // Some JSON packs may export as { default: [...] } depending on tooling.
  const rawArray = Array.isArray(raw) ? raw : raw?.default;

  if (!Array.isArray(rawArray)) {
    throw new Error(
      `[loadCategoryQuestions] Category "${category}" did not resolve to an array. Got: ${typeof raw}`
    );
  }

  // Phase 15.3 canonical adapter
  return normalizeQuestions(rawArray);
}

