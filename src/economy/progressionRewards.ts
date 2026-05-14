// src/economy/progressionRewards.ts
// Phase 5.4 — economy progression layer.
// Data-only helpers: level rewards, unlock messaging, and long-term economy pacing.

import { EconomyReward, clampBalance, xpRequiredForLevel } from "./economyRules";

export type LevelReward = Required<EconomyReward> & {
  level: number;
  label: string;
  unlocks: string[];
};

export const LEVEL_UNLOCKS: Record<number, string[]> = {
  2: ["Small ticket rewards"],
  3: ["Boost bundles"],
  5: ["Rare cosmetics"],
  7: ["Weekly reward bonus"],
  10: ["Epic cosmetics preview"],
  15: ["Premium events runway"],
  20: ["VIP economy tier preview"],
};

export function getLevelReward(level: number): LevelReward {
  const safeLevel = Math.max(2, Math.floor(level || 2));
  const milestone = safeLevel % 5 === 0;
  const majorMilestone = safeLevel % 10 === 0;

  return {
    level: safeLevel,
    label: milestone ? `Level ${safeLevel} milestone` : `Level ${safeLevel} reward`,
    xp: 0,
    coins: clampBalance(60 + safeLevel * 18 + (milestone ? 150 : 0) + (majorMilestone ? 300 : 0)),
    gems: majorMilestone ? 5 : milestone ? 2 : 0,
    tickets: milestone ? 2 : safeLevel % 3 === 0 ? 1 : 0,
    unlocks: LEVEL_UNLOCKS[safeLevel] ?? [],
  };
}

export function getLevelRewardsBetween(fromLevel: number, toLevel: number, alreadyClaimed: number[] = []) {
  const start = Math.max(1, Math.floor(fromLevel || 1));
  const end = Math.max(start, Math.floor(toLevel || start));
  const claimed = new Set(alreadyClaimed.map((n) => Math.floor(n)));
  const rewards: LevelReward[] = [];

  for (let level = start + 1; level <= end; level += 1) {
    if (!claimed.has(level)) rewards.push(getLevelReward(level));
  }

  return rewards;
}

export function summarizeLevelRewards(rewards: LevelReward[]): Required<EconomyReward> {
  return rewards.reduce(
    (sum, reward) => ({
      xp: 0,
      coins: clampBalance(sum.coins + reward.coins),
      gems: clampBalance(sum.gems + reward.gems),
      tickets: clampBalance(sum.tickets + reward.tickets),
    }),
    { xp: 0, coins: 0, gems: 0, tickets: 0 }
  );
}

export function getLevelProgress(level: number, xp: number) {
  const safeLevel = Math.max(1, Math.floor(level || 1));
  const required = xpRequiredForLevel(safeLevel);
  const current = clampBalance(xp);
  return {
    level: safeLevel,
    currentXp: current,
    requiredXp: required,
    percent: required <= 0 ? 0 : Math.max(0, Math.min(1, current / required)),
  };
}

export function getEconomyStatus(level: number, xp: number) {
  const progress = getLevelProgress(level, xp);
  const nextReward = getLevelReward(progress.level + 1);
  return {
    ...progress,
    nextReward,
    nextUnlocks: nextReward.unlocks,
  };
}

