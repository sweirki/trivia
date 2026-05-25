// src/questions/loadCategoryQuestions.ts
import { getQuestionPack, normalizeCategoryId } from "./questionRegistry";

export function loadCategoryQuestions(category: string) {
  const key = normalizeCategoryId(category);
  const pack = getQuestionPack(key);

  if (!key || !pack) {
    throw new Error(
      `[loadCategoryQuestions] Unsupported or missing question pack for category "${category}".`
    );
  }

  if (!pack.valid || !pack.raw.length) {
    throw new Error(
      `[loadCategoryQuestions] Category "${category}" has an empty or invalid question pack${
        pack.error ? `: ${pack.error}` : "."
      }`
    );
  }

  return pack.raw;
}



