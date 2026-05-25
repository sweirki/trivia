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
  promotionMatch: boolean;
  oneWinAway: boolean;
  shieldActive: boolean;
  shieldConsumed: boolean;
  demotionDanger: boolean;
  breakthroughLabel: string | null;
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
      item.minSR === rank.minSR,
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
  shieldConsumed?: boolean;
  promotionMatch?: boolean;
}): RankedPrestigeState {
  const {
    didWin,
    srBefore,
    srAfter,
    rankBefore,
    rankAfter,
    winStreak,
    shieldConsumed = false,
  } = params;

  const nextRankBefore = getNextRank(rankBefore);
  const srToNextBefore = getSRToNext(srBefore, rankBefore);
  const nextRank = getNextRank(rankAfter);
  const srToNext = getSRToNext(srAfter, rankAfter);
  const progressPercent = getRankProgress(srAfter, rankAfter);
  const promoted = rankAfter.minSR > rankBefore.minSR;
  const demoted = rankAfter.minSR < rankBefore.minSR;
  const dangerZone = srAfter <= rankAfter.minSR + 18 && srAfter > 0;
  const promotionPressure = srToNext !== null && srToNext <= 25;
  const promotionMatch =
    params.promotionMatch ||
    (!!nextRankBefore && srToNextBefore !== null && srToNextBefore <= 28);
  const oneWinAway = srToNext !== null && srToNext <= 22;
  const demotionDanger = dangerZone && !shieldConsumed && rankAfter.minSR > 0;
  const shieldActive = dangerZone && !demoted && rankAfter.minSR > 0;
  const breakthroughLabel = promoted
    ? `${formatRank(rankBefore)} → ${formatRank(rankAfter)}`
    : null;

  let headline = didWin ? "Ranked Victory" : "Ranked Defeat";
  let subtext = didWin
    ? "You gained Skill Rating and moved closer to the next division."
    : "You lost Skill Rating, but your climb is still alive.";

  if (promoted) {
    headline = "Division Breakthrough";
    subtext = `Promotion secured. You climbed into ${formatRank(rankAfter)}.`;
  } else if (shieldConsumed) {
    headline = "Shield Consumed";
    subtext = "Your division shield absorbed the drop. Win the next match to rebuild safety.";
  } else if (demoted) {
    headline = "Demotion";
    subtext = `You dropped to ${formatRank(rankAfter)}. Win the next match to recover momentum.`;
  } else if (promotionMatch && didWin) {
    headline = "Promotion Pressure Won";
    subtext = nextRank
      ? `${srToNext} SR from ${formatRank(nextRank)}. The breakthrough is within reach.`
      : "You handled the ladder pressure at the elite ceiling.";
  } else if (oneWinAway) {
    headline = "One Win Away";
    subtext = `${srToNext} SR from ${nextRank ? formatRank(nextRank) : "the next rank"}. One clean win can do it.`;
  } else if (promotionPressure) {
    headline = "Promotion Match Near";
    subtext = `${srToNext} SR from ${nextRank ? formatRank(nextRank) : "the next rank"}. Keep the pressure on.`;
  } else if (demotionDanger) {
    headline = "Demotion Danger";
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
    promotionMatch,
    oneWinAway,
    shieldActive,
    shieldConsumed,
    demotionDanger,
    breakthroughLabel,
    headline,
    subtext,
  };
}
