// src/cosmetics/cosmeticSelectors.ts
import { COSMETICS_CATALOG } from "./catalog";
import { CosmeticCategory, CosmeticItem } from "./types";
import type { PlayerCosmeticsState } from "./playerCosmetics";

export const COSMETIC_CATEGORY_LABELS: Record<CosmeticCategory, string> = {
  [CosmeticCategory.AVATAR]: "Avatars",
  [CosmeticCategory.AVATAR_FRAME]: "Frames",
  [CosmeticCategory.PROFILE_BACKGROUND]: "Backgrounds",
  [CosmeticCategory.BADGE]: "Badges",
  [CosmeticCategory.ARENA_BANNER]: "Arena Banners",
  [CosmeticCategory.ANSWER_TRAIL]: "Answer Trails",
  [CosmeticCategory.STREAK_AURA]: "Streak Auras",
};

export const COSMETIC_STORE_TABS: CosmeticCategory[] = [
  CosmeticCategory.AVATAR,
  CosmeticCategory.AVATAR_FRAME,
  CosmeticCategory.PROFILE_BACKGROUND,
  CosmeticCategory.BADGE,
  CosmeticCategory.ARENA_BANNER,
  CosmeticCategory.ANSWER_TRAIL,
  CosmeticCategory.STREAK_AURA,
];

export function getCosmeticById(id?: string | null): CosmeticItem | null {
  if (!id) return null;
  return COSMETICS_CATALOG.find((item) => item.id === id) ?? null;
}

export function getEquippedCosmetic(
  cosmetics: PlayerCosmeticsState | undefined | null,
  category: CosmeticCategory
): CosmeticItem | null {
  const id = cosmetics?.equipped?.[category];
  return getCosmeticById(id);
}

export function getCosmeticsByCategory(category: CosmeticCategory): CosmeticItem[] {
  return COSMETICS_CATALOG.filter((item) => item.category === category);
}
