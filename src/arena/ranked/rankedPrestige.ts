import type { RankInfo } from "@/arena/store/useArenaRankSystem";
import { RANK_TABLE } from "@/arena/store/useArenaRankSystem";

export type RankedPrestigeState = {
  rankLabel: string;
  nextRankLabel: string | null;
  progressPercent: number;
  srToNext: number | null;
  promoted: boolean;
  demoted: boolean;
  dangerZone: boolean;
  promotionPressure: boolean;
  shieldActive: boolean;
  headline: string;
  subtext: string;
};

export function formatRank(rank: RankInfo): string {
  return rank.division ? `${rank.league} ${rank.division}` : rank.league;
}

export function getNextRank(rank: RankInfo): RankInfo | null {
  const index = RANK_TABLE.findIndex(
    (item) =>
      item.league === rank.league &&
      item.division === rank.division &&
      item.minSR === rank.minSR
  );

  if (index < 0 || index >= RANK_TABLE.length - 1) return null;
  return RANK_TABLE[index + 1];
}

export function getRankProgress(sr: number, rank: RankInfo): number {
  const range = Math.max(1, rank.maxSR - rank.minSR);
  const current = sr - rank.minSR;
  return Math.min(100, Math.max(0, (current / range) * 100));
}

export function getSRToNext(sr: number, rank: RankInfo): number | null {
  const nextRank = getNextRank(rank);
  if (!nextRank) return null;
  return Math.max(0, nextRank.minSR - sr);
}

export function buildRankedPrestigeState(params: {
  didWin: boolean;
  srBefore: number;
  srAfter: number;
  rankBefore: RankInfo;
  rankAfter: RankInfo;
  winStreak: number;
}): RankedPrestigeState {
  const { didWin, srBefore, srAfter, rankBefore, rankAfter, winStreak } = params;
  const nextRank = getNextRank(rankAfter);
  const srToNext = getSRToNext(srAfter, rankAfter);
  const progressPercent = getRankProgress(srAfter, rankAfter);
  const promoted = rankAfter.minSR > rankBefore.minSR;
  const demoted = rankAfter.minSR < rankBefore.minSR;
  const dangerZone = srAfter <= rankAfter.minSR + 18 && srAfter > 0;
  const promotionPressure = srToNext !== null && srToNext <= 25;
  const shieldActive = !didWin && srBefore <= rankBefore.minSR + 8 && rankBefore.minSR > 0;

  let headline = didWin ? "Ranked Victory" : "Ranked Defeat";
  let subtext = didWin
    ? "You gained Skill Rating and moved closer to the next division."
    : "You lost Skill Rating, but your climb is still alive.";

  if (promoted) {
    headline = "Promotion Unlocked";
    subtext = `You climbed into ${formatRank(rankAfter)}.`;
  } else if (demoted) {
    headline = "Demotion";
    subtext = `You dropped to ${formatRank(rankAfter)}. Win the next match to recover momentum.`;
  } else if (promotionPressure) {
    headline = "Promotion Match Near";
    subtext = `${srToNext} SR from ${nextRank ? formatRank(nextRank) : "the next rank"}. One clean win can do it.`;
  } else if (dangerZone) {
    headline = "Danger Zone";
    subtext = "You are close to the bottom of this division. Protect your rank.";
  } else if (winStreak >= 3) {
    headline = `${winStreak} Win Streak`;
    subtext = "Your streak is adding bonus SR. Keep the pressure on.";
  }

  return {
    rankLabel: formatRank(rankAfter),
    nextRankLabel: nextRank ? formatRank(nextRank) : null,
    progressPercent,
    srToNext,
    promoted,
    demoted,
    dangerZone,
    promotionPressure,
    shieldActive,
    headline,
    subtext,
  };
}

