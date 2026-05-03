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
 * ------------------------------------------------------------
 * 4) DEFAULT STATE
 * ------------------------------------------------------------
 * New players start with no cosmetics equipped.
 * Starter cosmetics (if any) should be granted explicitly.
 */
export const DEFAULT_PLAYER_COSMETICS_STATE: PlayerCosmeticsState = {
  owned: {},
  equipped: {},
};

/**
 * ------------------------------------------------------------
 * 5) HARD GUARANTEES
 * ------------------------------------------------------------
 * - Equipping does NOT modify gameplay
 * - Equipping replaces previous cosmetic in the same category
 * - Ownership must be validated before equip in logic layer
 */

