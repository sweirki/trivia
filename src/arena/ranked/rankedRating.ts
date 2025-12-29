// src/arena/ranked/rankedRating.ts

import { RANKED_ELO, RANKED_TIER_BANDS } from "./rankedConstants";
import { RankedMatchResult, RankedTier } from "./rankedTypes";

/**
 * Calculate expected score using ELO probability
 */
export function calculateExpectedScore(
  playerRating: number,
  opponentRating: number
): number {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

/**
 * Convert match result to numeric score
 */
export function resultToScore(result: RankedMatchResult): number {
  switch (result) {
    case "win":
      return 1;
    case "draw":
      return 0.5;
    case "loss":
      return 0;
  }
}

/**
 * Calculate new ELO rating
 */
export function calculateNewRating(
  playerRating: number,
  opponentRating: number,
  result: RankedMatchResult
): number {
  const expected = calculateExpectedScore(playerRating, opponentRating);
  const actual = resultToScore(result);

  const delta =
    RANKED_ELO.K_FACTOR * (actual - expected);

  return Math.round(playerRating + delta);
}

/**
 * Resolve tier from rating
 */
export function resolveTier(rating: number): RankedTier {
  const tiers = Object.entries(RANKED_TIER_BANDS) as [
    RankedTier,
    { min: number; max: number }
  ][];

  for (const [tier, band] of tiers) {
    if (rating >= band.min && rating <= band.max) {
      return tier;
    }
  }

  return "Bronze"; // safety fallback
}
