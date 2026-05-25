// src/arena/arenaEconomyRules.ts
// Central Arena economy rules. Keep costs/rewards visible and predictable.

export type ArenaModeKey = "ranked" | "survival" | "power" | "tournament";

export type ArenaRewardPreview = {
  coins: number;
  tickets: number;
  arenaTokens: number;
};

export type ArenaModeConfig = {
  tickets: number;
  questions?: number;
  rewardLabel: string;
};

export const ARENA_MODE_CONFIG: Record<ArenaModeKey, ArenaModeConfig> = {
  ranked: {
    tickets: 5,
    questions: 7,
    rewardLabel: "SR climb • 200 coins • 2 arena tokens on win",
  },
  survival: {
    tickets: 4,
    rewardLabel: "Coins scale by rounds • arena tokens at milestones",
  },
  power: {
    tickets: 5,
    rewardLabel: "Coins scale by score • efficiency earns arena tokens",
  },
  tournament: {
    tickets: 8,
    rewardLabel: "Highest-stakes bracket prestige",
  },
};

export const ARENA_ENTRY_COSTS: Record<ArenaModeKey, { tickets: number }> = {
  ranked: { tickets: ARENA_MODE_CONFIG.ranked.tickets },
  survival: { tickets: ARENA_MODE_CONFIG.survival.tickets },
  power: { tickets: ARENA_MODE_CONFIG.power.tickets },
  tournament: { tickets: ARENA_MODE_CONFIG.tournament.tickets },
};

export const ARENA_REWARD_RULES = {
  rankedWinCoins: 200,
  rankedWinTokens: 2,
  survivalCoinPerRound: 12,
  survivalCoinCap: 300,
  survivalTokenMilestone: 10,
  survivalEliteTokenMilestone: 20,
  powerCoinPerScore: 10,
  powerStrongScore: 12,
  powerEfficientScore: 18,
  powerEfficientMaxPowerUps: 3,
};

export function getRankedRewardPreview(didWin: boolean): ArenaRewardPreview {
  return didWin
    ? {
        coins: ARENA_REWARD_RULES.rankedWinCoins,
        tickets: 0,
        arenaTokens: ARENA_REWARD_RULES.rankedWinTokens,
      }
    : { coins: 0, tickets: 0, arenaTokens: 0 };
}

export function getPowerRewardPreview(score: number, powerUpsUsed = 0): ArenaRewardPreview {
  if (score <= 0) return { coins: 0, tickets: 0, arenaTokens: 0 };

  const didStrongRun = score >= ARENA_REWARD_RULES.powerStrongScore;
  const didEfficientRun =
    score >= ARENA_REWARD_RULES.powerEfficientScore &&
    powerUpsUsed <= ARENA_REWARD_RULES.powerEfficientMaxPowerUps;

  return {
    coins: Math.max(0, score * ARENA_REWARD_RULES.powerCoinPerScore),
    tickets: 0,
    arenaTokens: didEfficientRun ? 3 : didStrongRun ? 1 : 0,
  };
}

export function getSurvivalRewardPreview(rounds: number): ArenaRewardPreview {
  if (rounds <= 0) return { coins: 0, tickets: 0, arenaTokens: 0 };

  return {
    coins: Math.min(
      ARENA_REWARD_RULES.survivalCoinCap,
      rounds * ARENA_REWARD_RULES.survivalCoinPerRound
    ),
    tickets: 0,
    arenaTokens:
      rounds >= ARENA_REWARD_RULES.survivalEliteTokenMilestone
        ? 4
        : rounds >= ARENA_REWARD_RULES.survivalTokenMilestone
          ? 2
          : 0,
  };
}

export function formatArenaCost(mode: ArenaModeKey) {
  const cost = ARENA_ENTRY_COSTS[mode];
  return `${cost.tickets} ticket${cost.tickets === 1 ? "" : "s"}`;
}

export function formatArenaReward(reward: ArenaRewardPreview) {
  const parts: string[] = [];

  if (reward.tickets > 0) parts.push(`+${reward.tickets} ticket${reward.tickets === 1 ? "" : "s"}`);
  if (reward.coins > 0) parts.push(`+${reward.coins} coins`);
  if (reward.arenaTokens > 0) parts.push(`+${reward.arenaTokens} arena token${reward.arenaTokens === 1 ? "" : "s"}`);

  return parts.length ? parts.join(" • ") : "No reward";
}
