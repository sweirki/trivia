// src/arena/ranked/rankedConstants.ts

import { RankedTier } from "./rankedTypes";

/**
 * ELO configuration
 */
export const RANKED_ELO = {
  BASE_RATING: 1000,
  K_FACTOR: 24,
};

/**
 * Tier thresholds (rating bands)
 * LOCKED for Phase 11
 */
export const RANKED_TIER_BANDS: Record<
  RankedTier,
  { min: number; max: number }
> = {
  Bronze: { min: 0, max: 999 },
  Silver: { min: 1000, max: 1199 },
  Gold: { min: 1200, max: 1399 },
  Platinum: { min: 1400, max: 1599 },
  Diamond: { min: 1600, max: Infinity },
};

/**
 * Ranked match configuration
 */
export const RANKED_MATCH_CONFIG = {
  QUESTIONS_PER_MATCH: 7,
  TIME_PER_QUESTION: 10, // seconds
  ALLOW_DRAW: true,
};

/**
 * Temporary AI opponent defaults
 */
export const RANKED_AI_DEFAULT = {
  BASE_RATING: 1000,
};

