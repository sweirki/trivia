// src/cosmetics/playerCosmetics.ts
/**
 * ============================================================
 * PLAYER COSMETICS STATE — PHASE D2.2 (DATA MODEL)
 * ============================================================
 * This file defines how player-owned cosmetics are stored and equipped.
 *
 * Rules:
 * - Ownership and equip state are strictly separated
 * - One equipped cosmetic per category
 * - No gameplay impact
 * - Firestore-friendly shape
 */

import { COSMETICS_CATALOG } from "./catalog";
import { CosmeticCategory } from "./types";

/**
 * ------------------------------------------------------------
 * 1) OWNERSHIP MODEL
 * ------------------------------------------------------------
 * Map of cosmeticId -> true
 * Presence means owned.
 */
export type PlayerOwnedCosmetics = Record<string, true>;

/**
 * ------------------------------------------------------------
 * 2) EQUIPPED MODEL
 * ------------------------------------------------------------
 * Each category may equip at most ONE cosmetic.
 */
export type PlayerEquippedCosmetics = Partial<Record<CosmeticCategory, string>>;

/**
 * ------------------------------------------------------------
 * 3) PLAYER COSMETICS ROOT
 * ------------------------------------------------------------
 * This is the exact shape persisted to Firestore:
 * players/{uid}/cosmetics
 */
export type PlayerCosmeticsState = {
  owned: PlayerOwnedCosmetics;
  equipped: PlayerEquippedCosmetics;
};

/**
 * Starter cosmetics must use REAL catalog IDs. These are free baseline items
 * that every player can equip even before buying premium cosmetics.
 */
export const STARTER_COSMETIC_IDS = [
  "avatar_default_blue",
  "avatar_sunrise_orange",
  "avatar_mint_focus",
  "frame_silver_clean",
  "profile_bg_night",
  "badge_starter",
] as const;

const CATALOG_IDS = new Set(COSMETICS_CATALOG.map((item) => item.id));

function starterOwnedCosmetics(): PlayerOwnedCosmetics {
  return STARTER_COSMETIC_IDS.reduce<PlayerOwnedCosmetics>((owned, id) => {
    if (CATALOG_IDS.has(id)) {
      owned[id] = true;
    }

    return owned;
  }, {});
}

/**
 * ------------------------------------------------------------
 * 4) DEFAULT STATE
 * ------------------------------------------------------------
 * New players start with free starter cosmetics owned and a valid avatar
 * equipped. Never use image paths here; store IDs only.
 */
export const DEFAULT_PLAYER_COSMETICS_STATE: PlayerCosmeticsState = {
  owned: starterOwnedCosmetics(),
  equipped: {
    [CosmeticCategory.AVATAR]: "avatar_default_blue",
  },
};

/**
 * Normalizes old/local/cloud cosmetics safely.
 *
 * This protects against older builds that stored invalid IDs such as
 * "avatar_01", missing owned/equipped maps, or equipped cosmetics that were
 * never owned.
 */
export function normalizePlayerCosmeticsState(
  input?: Partial<PlayerCosmeticsState> | null
): PlayerCosmeticsState {
  const owned: PlayerOwnedCosmetics = {
    ...DEFAULT_PLAYER_COSMETICS_STATE.owned,
  };

  if (input?.owned && typeof input.owned === "object") {
    Object.keys(input.owned).forEach((id) => {
      if (CATALOG_IDS.has(id)) {
        owned[id] = true;
      }
    });
  }

  const equipped: PlayerEquippedCosmetics = {
    ...DEFAULT_PLAYER_COSMETICS_STATE.equipped,
  };

  if (input?.equipped && typeof input.equipped === "object") {
    Object.values(CosmeticCategory).forEach((category) => {
      const id = input.equipped?.[category];
      const item = id ? COSMETICS_CATALOG.find((candidate) => candidate.id === id) : null;

      if (item && item.category === category && owned[id]) {
        equipped[category] = id;
      }
    });
  }

  return { owned, equipped };
}

/**
 * ------------------------------------------------------------
 * 5) HARD GUARANTEES
 * ------------------------------------------------------------
 * - Equipping does NOT modify gameplay
 * - Equipping replaces previous cosmetic in the same category
 * - Ownership must be validated before equip in logic layer
 */


