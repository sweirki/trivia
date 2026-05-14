// src/arena/arenaEconomyRules.ts
// Central Arena economy rules. Keep costs/rewards visible and predictable.

export type ArenaModeKey = "ranked" | "survival" | "power" | "tournament";

export type ArenaRewardPreview = {
  coins: number;
  tickets: number;
  arenaTokens: number;
};

export const ARENA_ENTRY_COSTS: Record<ArenaModeKey, { tickets: number }> = {
  ranked: { tickets: 5 },
  survival: { tickets: 6 },
  power: { tickets: 6 },
  tournament: { tickets: 8 },
};

export const ARENA_REWARD_RULES = {
  rankedWinTickets: ARENA_ENTRY_COSTS.ranked.tickets * 2,
  powerWinTickets: ARENA_ENTRY_COSTS.power.tickets * 2,
  tournamentWinTickets: ARENA_ENTRY_COSTS.tournament.tickets * 2,
  rankedWinTokens: 2,
  survivalTokenMilestone: 12,
  powerTokenScore: 4,
};

export function getRankedRewardPreview(didWin: boolean): ArenaRewardPreview {
  return didWin
    ? { coins: 0, tickets: ARENA_REWARD_RULES.rankedWinTickets, arenaTokens: ARENA_REWARD_RULES.rankedWinTokens }
    : { coins: 0, tickets: 0, arenaTokens: 0 };
}

export function getPowerRewardPreview(score: number): ArenaRewardPreview {
  if (score <= 0) return { coins: 0, tickets: 0, arenaTokens: 0 };

  return {
    coins: 0,
    tickets: score >= 4 ? ARENA_REWARD_RULES.powerWinTickets : Math.floor(ARENA_ENTRY_COSTS.power.tickets / 2),
    arenaTokens: score >= ARENA_REWARD_RULES.powerTokenScore ? 1 : 0,
  };
}

export function getSurvivalRewardPreview(rounds: number): ArenaRewardPreview {
  if (rounds < 5) return { coins: 0, tickets: 0, arenaTokens: 0 };

  const tickets =
    rounds >= 20 ? ARENA_ENTRY_COSTS.survival.tickets * 2 :
    rounds >= 12 ? ARENA_ENTRY_COSTS.survival.tickets :
    Math.floor(ARENA_ENTRY_COSTS.survival.tickets / 2);

  return {
    coins: 0,
    tickets,
    arenaTokens: rounds >= ARENA_REWARD_RULES.survivalTokenMilestone ? 1 : 0,
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
