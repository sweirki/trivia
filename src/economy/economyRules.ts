// src/economy/economyRules.ts
// Phase 5A — single source of truth for economy numbers.

export type EconomyReward = {
  xp: number;
  coins: number;
  gems?: number;
  tickets?: number;
};

export type GameRewardInput = {
  mode: string | null;
  totalQuestions: number;
  correct: number;
  accuracy: number; // 0..1
  perfect: boolean;
};

export const STARTING_ECONOMY = {
  xp: 0,
  level: 1,
  coins: 250,
  gems: 10,
  tickets: 10,
};

export const MAX_BALANCE = 9_999_999;

export function clampBalance(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(MAX_BALANCE, Math.floor(value)));
}

export function xpRequiredForLevel(level: number) {
  const safeLevel = Math.max(1, Math.floor(level || 1));
  return safeLevel * 150 + safeLevel * safeLevel * 6;
}

export function applyXpProgress(currentXp: number, currentLevel: number, xpGain: number) {
  let xp = clampBalance(currentXp) + clampBalance(xpGain);
  let level = Math.max(1, Math.floor(currentLevel || 1));
  let leveledUp = false;

  while (xp >= xpRequiredForLevel(level)) {
    xp -= xpRequiredForLevel(level);
    level += 1;
    leveledUp = true;
  }

  return { xp, level, leveledUp };
}

export function getVipMultiplier(tier: number) {
  // Phase 5.4: VIP effect remains local-preview only until RevenueCat is connected.
  // Existing vipTier support is preserved for future entitlement mapping.
  if (tier >= 4) return 2.25;
  if (tier === 3) return 1.75;
  if (tier === 2) return 1.4;
  if (tier === 1) return 1.15;
  return 1;
}

export function getDailyStreakMultiplier(streak: number) {
  const safe = Math.max(0, Math.floor(streak || 0));
  if (safe >= 30) return 1.5;
  if (safe >= 14) return 1.35;
  if (safe >= 7) return 1.2;
  if (safe >= 3) return 1.1;
  return 1;
}

export function applyRewardMultipliers(
  reward: EconomyReward,
  vipTier: number,
  boosts: { xp?: number; coins?: number; gems?: number }
): Required<EconomyReward> {
  const vip = getVipMultiplier(vipTier);

  return {
    xp: clampBalance(reward.xp * vip * (1 + (boosts.xp ?? 0))),
    coins: clampBalance(reward.coins * vip * (1 + (boosts.coins ?? 0))),
    gems: clampBalance((reward.gems ?? 0) * (1 + (boosts.gems ?? 0))),
    tickets: clampBalance(reward.tickets ?? 0),
  };
}

export const DAILY_LOGIN_REWARD_TABLE: Required<EconomyReward>[] = [
  { xp: 20, coins: 50, gems: 0, tickets: 0 },
  { xp: 25, coins: 60, gems: 0, tickets: 0 },
  { xp: 30, coins: 75, gems: 0, tickets: 0 },
  { xp: 40, coins: 90, gems: 0, tickets: 0 },
  { xp: 50, coins: 120, gems: 1, tickets: 0 },
  { xp: 65, coins: 150, gems: 1, tickets: 0 },
  { xp: 100, coins: 250, gems: 2, tickets: 1 },
];

export function getDailyLoginReward(streak: number): Required<EconomyReward> {
  const safeStreak = Math.max(1, Math.floor(streak || 1));
  const index = ((safeStreak - 1) % 7);
  const base = DAILY_LOGIN_REWARD_TABLE[index];
  const multiplier = getDailyStreakMultiplier(safeStreak);

  return {
    xp: clampBalance(base.xp * multiplier),
    coins: clampBalance(base.coins * multiplier),
    gems: base.gems,
    tickets: base.tickets,
  };
}

export const WEEKLY_DAILY_TARGET = 5;
export const WEEKLY_DAILY_REWARD: Required<EconomyReward> = {
  xp: 300,
  coins: 250,
  gems: 2,
  tickets: 1,
};

export function getGameCompletionReward(input: GameRewardInput): Required<EconomyReward> {
  const total = Math.max(1, input.totalQuestions || 1);
  const correct = Math.max(0, input.correct || 0);
  const accuracy = Math.max(0, Math.min(1, input.accuracy || 0));

  const modeXp =
    input.mode === "speed" ? 1.15 :
    input.mode === "timed60" ? 1.2 :
    input.mode === "timed90" ? 1.3 :
    input.mode === "sudden" ? 1.35 :
    input.mode === "daily" ? 1.2 :
    1;

  let xp = Math.round((10 + correct * 8 + total * 2) * modeXp);
  let coins = Math.round(5 + correct * 3);
  let gems = 0;
  let tickets = 0;

  if (accuracy >= 0.7) {
    xp += 15;
    coins += 5;
  }

  if (accuracy >= 0.9) {
    xp += 25;
    coins += 10;
  }

  if (input.perfect && correct === total) {
    xp += 40;
    coins += 20;
    gems += input.mode === "daily" ? 2 : 1;
  }

  if (input.mode === "daily" && accuracy >= 0.8) {
    tickets += 1;
  }

  return {
    xp: clampBalance(xp),
    coins: clampBalance(coins),
    gems: clampBalance(gems),
    tickets: clampBalance(tickets),
  };
}

export function getDayKeyUTC(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getWeekKeyUTC(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}



