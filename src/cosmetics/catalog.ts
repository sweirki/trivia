// src/cosmetics/catalog.ts
/**
 * ============================================================
 * COSMETICS CATALOG — PHASE D2.2 (DATA LAYER)
 * ============================================================
 * This file defines ALL purchasable cosmetics.
 *
 * Rules:
 * - Must obey CosmeticRarity price bands
 * - Must obey EconomySpec currency rules
 * - No gameplay impact
 * - Data-only (no logic, no UI)
 */

import { CosmeticItem, CosmeticCategory, CosmeticRarity } from "./types";
/**
 * ------------------------------------------------------------
 * RARITY PRICE BANDS (DESIGN CONTRACT)
 * ------------------------------------------------------------
 *
 * These bands ensure inflation control and consistent scaling.
 * Prices must stay within these ranges unless EconomySpec is updated.
 *
 * Enforcement logic may be added later (D2.3).
 */

export const COSMETIC_RARITY_PRICE_BANDS = {
  COMMON: {
    COINS: { min: 50, max: 150 },
  },
  RARE: {
    COINS: { min: 300, max: 600 },
  },
  EPIC: {
    COINS: { min: 800, max: 1500 },
    GEMS: { min: 5, max: 15 },
  },
  LEGENDARY: {
    GEMS: { min: 20, max: 50 },
  },
} as const;

export const COSMETICS_CATALOG: CosmeticItem[] = [
  {
    id: "avatar_default_blue",
    category: CosmeticCategory.AVATAR,
    rarity: CosmeticRarity.COMMON,
    name: "Blue Starter Avatar",
    description: "A clean blue avatar for new heroes.",
    icon: "avatar_blue_01",
    price: { currency: "COINS", amount: 100 },
  },
  {
    id: "avatar_frame_gold",
    category: CosmeticCategory.AVATAR_FRAME,
    rarity: CosmeticRarity.RARE,
    name: "Gold Frame",
    description: "A shiny gold avatar frame.",
    icon: "frame_gold_01",
    price: { currency: "COINS", amount: 400 },
  },
  {
  id: "badge_starter",
  category: CosmeticCategory.BADGE,
  rarity: CosmeticRarity.COMMON,
  name: "Starter Badge",
  description: "Awarded to every new hero.",
  icon: "badge_starter_01",
  price: { currency: "COINS", amount: 50 },

 },
  {
    id: "profile_bg_night",
    category: CosmeticCategory.PROFILE_BACKGROUND,
    rarity: CosmeticRarity.EPIC,
    name: "Night Sky Background",
    description: "A calm night sky for your profile.",
    icon: "bg_night_01",
    price: { currency: "GEMS", amount: 10 },
  },
  {
    id: "badge_legend_founder",
    category: CosmeticCategory.BADGE,
    rarity: CosmeticRarity.LEGENDARY,
    name: "Legend Founder Badge",
    description: "Awarded to early legends.",
    icon: "badge_founder_legend",
    price: { currency: "GEMS", amount: 30 },
    limited: true,
  },
];

