// src/questions/categoryFileMap.ts
// Backward-compatible helpers kept for older imports.
// The real Phase 3 source of truth is questionRegistry.ts.

import {
  getQuestionPack,
  getPlayableQuestionPacks,
  hasPlayableQuestionPack,
  normalizeCategoryId,
} from "./questionRegistry";

export type CategoryKey = string;

export const categoryFileMap: Record<string, any[]> = getPlayableQuestionPacks().reduce<
  Record<string, any[]>
>((acc, pack) => {
  acc[pack.id] = pack.raw;
  return acc;
}, {});

export function toCategoryKey(category: string | null | undefined): CategoryKey | null {
  const id = normalizeCategoryId(category);
  return id && getQuestionPack(id) ? id : null;
}

export function isPlayableCategory(category: string | null | undefined): boolean {
  return hasPlayableQuestionPack(category);
}



