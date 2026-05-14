// src/cosmetics/types.ts
/**
 * ============================================================
 * COSMETIC TYPES — PHASE D2.1 (LOCKED DESIGN CONTRACT)
 * ============================================================
 * This file defines WHAT cosmetics are — not how they are stored or shown.
 *
 * Rules:
 * - Cosmetics are 100% cosmetic. No gameplay impact.
 * - Pricing must obey EconomySpec rarity bands.
 * - No UI logic, no Firestore logic here.
 * - Treat as LOCKED after D2.1 approval.
 */

import { Currency } from "../economy/EconomySpec";

/**
 * ------------------------------------------------------------
 * 1) COSMETIC CATEGORIES (FIXED SET)
 * ------------------------------------------------------------
 */
export enum CosmeticCategory {
  AVATAR = "AVATAR",
  AVATAR_FRAME = "AVATAR_FRAME",
  PROFILE_BACKGROUND = "PROFILE_BACKGROUND",
  BADGE = "BADGE",
  ARENA_BANNER = "ARENA_BANNER",
  ANSWER_TRAIL = "ANSWER_TRAIL",
  STREAK_AURA = "STREAK_AURA",
}

/**
 * ------------------------------------------------------------
 * 2) RARITY TIERS (FIXED ORDER)
 * ------------------------------------------------------------
 */
export enum CosmeticRarity {
  COMMON = "COMMON",
  RARE = "RARE",
  EPIC = "EPIC",
  LEGENDARY = "LEGENDARY",
}

/**
 * ------------------------------------------------------------
 * 3) PRICING LAW (RARITY → ALLOWED BANDS)
 * ------------------------------------------------------------
 * These are DESIGN BANDS, not enforced math.
 * Catalog items must price within these ranges.
 *
 * EconomySpec is the authority on what currencies are allowed.
 */
export type PriceBand = {
  currency: Currency;
  min: number;
  max: number;
};

export const COSMETIC_PRICE_BANDS: Record<CosmeticRarity, PriceBand[]> = {
  [CosmeticRarity.COMMON]: [
    { currency: "COINS", min: 50, max: 150 },
  ],
  [CosmeticRarity.RARE]: [
    { currency: "COINS", min: 200, max: 500 },
  ],
  [CosmeticRarity.EPIC]: [
    { currency: "COINS", min: 600, max: 1200 },
    { currency: "GEMS", min: 5, max: 15 },
  ],
  [CosmeticRarity.LEGENDARY]: [
    { currency: "GEMS", min: 20, max: 50 },
  ],
} as const;

/**
 * ------------------------------------------------------------
 * 4) COSMETIC ITEM (DATA-ONLY)
 * ------------------------------------------------------------
 * IMPORTANT:
 * - No gameplay flags
 * - No multipliers
 * - No boosts
 */
export type CosmeticItem = {
  id: string;
  category: CosmeticCategory;
  rarity: CosmeticRarity;

  /** Display */
  name: string;
  description?: string;
  icon: string; // asset key or path

  /** Pricing */
  price: {
    currency: Currency;
    amount: number;
  };

  /** Availability */
  limited?: boolean; // seasonal / event-limited
  seasonId?: string; // if tied to a season
  vipOnly?: boolean; // cosmetic requires active VIP to purchase/equip
  unlockType?: "STORE" | "VIP" | "SEASON" | "ACHIEVEMENT" | "EVENT";

  /** Metadata */
  createdAt?: string;
};

/**
 * ------------------------------------------------------------
 * 5) OWNERSHIP & EQUIP (PLAYER STATE SHAPE)
 * ------------------------------------------------------------
 * Separated from catalog on purpose.
 */
export type OwnedCosmetics = Record<string, true>; // cosmeticId -> owned

export type EquippedCosmetics = Partial<Record<CosmeticCategory, string>>; // category -> cosmeticId

/**
 * ------------------------------------------------------------
 * 6) HARD GUARANTEES (TYPE-LEVEL INTENT)
 * ------------------------------------------------------------
 * - CosmeticItem MUST NOT affect gameplay.
 * - If a future feature needs gameplay impact, it is NOT a cosmetic.
 * - Do NOT add fields like: power, bonus, multiplier, boost, stat, effect.
 */


