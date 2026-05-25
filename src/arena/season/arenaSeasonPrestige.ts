import type { RankInfo } from "@/arena/store/useArenaRankSystem";

const DAY_MS = 24 * 60 * 60 * 1000;
export const ARENA_SEASON_LENGTH_DAYS = 14;

export type ArenaSeasonRewardTier =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "master"
  | "legendary";

export type ArenaSeasonReward = {
  tier: ArenaSeasonRewardTier;
  title: string;
  rewardLabel: string;
  tokenReward: number;
  profileLabel: string;
  tone: "safe" | "good" | "elite";
};

export function getRankLabel(
  rank?: Pick<RankInfo, "league" | "division"> | null,
) {
  if (!rank) return "Unranked";
  return `${rank.league}${rank.division ? ` ${rank.division}` : ""}`;
}

export function buildArenaSeasonEndsAt(startedAt = Date.now()) {
  return startedAt + ARENA_SEASON_LENGTH_DAYS * DAY_MS;
}

export function getArenaSeasonCountdown(
  endsAt?: number | null,
  now = Date.now(),
) {
  if (!endsAt || endsAt <= now) return "ENDING";
  const remaining = endsAt - now;
  const days = Math.floor(remaining / DAY_MS);
  const hours = Math.floor((remaining % DAY_MS) / (60 * 60 * 1000));
  if (days > 0) return `${days}D ${String(hours).padStart(2, "0")}H`;
  const minutes = Math.max(
    1,
    Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000)),
  );
  return `${hours}H ${String(minutes).padStart(2, "0")}M`;
}

export function getArenaSeasonReward(highestSR: number): ArenaSeasonReward {
  if (highestSR >= 2700) {
    return {
      tier: "legendary",
      title: "Legendary Season",
      rewardLabel: "Legendary aura + 80 arena tokens",
      tokenReward: 80,
      profileLabel: "Legendary Peak",
      tone: "elite",
    };
  }
  if (highestSR >= 2000) {
    return {
      tier: "master",
      title: "Master Season",
      rewardLabel: "Master crest + 55 arena tokens",
      tokenReward: 55,
      profileLabel: "Master Peak",
      tone: "elite",
    };
  }
  if (highestSR >= 1600) {
    return {
      tier: "diamond",
      title: "Diamond Season",
      rewardLabel: "Diamond banner + 40 arena tokens",
      tokenReward: 40,
      profileLabel: "Diamond Peak",
      tone: "elite",
    };
  }
  if (highestSR >= 1200) {
    return {
      tier: "platinum",
      title: "Platinum Season",
      rewardLabel: "Platinum badge + 28 arena tokens",
      tokenReward: 28,
      profileLabel: "Platinum Peak",
      tone: "good",
    };
  }
  if (highestSR >= 800) {
    return {
      tier: "gold",
      title: "Gold Season",
      rewardLabel: "Gold frame + 20 arena tokens",
      tokenReward: 20,
      profileLabel: "Gold Peak",
      tone: "good",
    };
  }
  if (highestSR >= 400) {
    return {
      tier: "silver",
      title: "Silver Season",
      rewardLabel: "Silver badge + 12 arena tokens",
      tokenReward: 12,
      profileLabel: "Silver Peak",
      tone: "safe",
    };
  }
  return {
    tier: "bronze",
    title: "Bronze Season",
    rewardLabel: "Bronze badge + 6 arena tokens",
    tokenReward: 6,
    profileLabel: "Bronze Peak",
    tone: "safe",
  };
}

export function getArenaSeasonMotivation(sr: number, highestSR: number) {
  if (highestSR >= 1600)
    return "Elite reward tier locked. Protect your peak before reset.";
  if (sr >= highestSR - 40) return "A new season peak is within reach.";
  return "Climb SR to improve your end-of-season reward tier.";
}

export function getArenaSeasonResetCopy(params: {
  season: number;
  highestRankLabel: string;
  highestSR: number;
  rewardLabel: string;
  softResetSR: number;
}) {
  return `Season ${params.season} closed at ${params.highestRankLabel} (${params.highestSR} peak SR). ${params.rewardLabel}. New season starts at ${params.softResetSR} SR.`;
}
