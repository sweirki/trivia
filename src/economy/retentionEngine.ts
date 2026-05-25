// src/economy/retentionEngine.ts
// Phase 5.5 — retention + motivation engine.
// Pure helpers only: no UI, no storage, no direct store imports.

import { EconomyReward, clampBalance, getDayKeyUTC } from "./economyRules";

export type RetentionFlags = {
  dailyReady: boolean;
  streakAtRisk: boolean;
  comebackAvailable: boolean;
};

export type RetentionSummary = {
  title: string;
  message: string;
  reward: Required<EconomyReward>;
  reasons: string[];
};

export type RetentionState = {
  playStreak: number;
  bestPlayStreak: number;
  lastPlayedDate: string | null;
  bestAccuracy: number;
  recentAccuracies: number[];
  claimedStreakMilestones: number[];
  lastRetentionSummary: RetentionSummary | null;
  notificationFlags: RetentionFlags;
};

export const DEFAULT_RETENTION_STATE: RetentionState = {
  playStreak: 0,
  bestPlayStreak: 0,
  lastPlayedDate: null,
  bestAccuracy: 0,
  recentAccuracies: [],
  claimedStreakMilestones: [],
  lastRetentionSummary: null,
  notificationFlags: {
    dailyReady: true,
    streakAtRisk: false,
    comebackAvailable: false,
  },
};

export type RetentionGameInput = {
  accuracy: number; // 0..1
  won: boolean;
  dateKey?: string;
};

const STREAK_MILESTONE_REWARDS: Record<number, Required<EconomyReward>> = {
  3: { xp: 40, coins: 75, gems: 0, tickets: 1 },
  7: { xp: 90, coins: 160, gems: 1, tickets: 2 },
  14: { xp: 180, coins: 320, gems: 2, tickets: 3 },
  30: { xp: 420, coins: 800, gems: 5, tickets: 6 },
};

function addReward(a: Required<EconomyReward>, b: Required<EconomyReward>): Required<EconomyReward> {
  return {
    xp: clampBalance(a.xp + b.xp),
    coins: clampBalance(a.coins + b.coins),
    gems: clampBalance(a.gems + b.gems),
    tickets: clampBalance(a.tickets + b.tickets),
  };
}

function emptyReward(): Required<EconomyReward> {
  return { xp: 0, coins: 0, gems: 0, tickets: 0 };
}

function daysBetween(from: string | null, to: string) {
  if (!from) return null;
  const a = Date.parse(`${from}T00:00:00.000Z`);
  const b = Date.parse(`${to}T00:00:00.000Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.floor((b - a) / 86400000);
}

export function normalizeRetentionState(value: any): RetentionState {
  return {
    playStreak: clampBalance(value?.playStreak ?? 0),
    bestPlayStreak: clampBalance(value?.bestPlayStreak ?? 0),
    lastPlayedDate: typeof value?.lastPlayedDate === "string" ? value.lastPlayedDate : null,
    bestAccuracy: Math.max(0, Math.min(1, Number(value?.bestAccuracy ?? 0))),
    recentAccuracies: Array.isArray(value?.recentAccuracies)
      ? value.recentAccuracies.map((n: any) => Math.max(0, Math.min(1, Number(n) || 0))).slice(-8)
      : [],
    claimedStreakMilestones: Array.isArray(value?.claimedStreakMilestones)
      ? value.claimedStreakMilestones.map((n: any) => Math.floor(Number(n))).filter((n: number) => n > 0)
      : [],
    lastRetentionSummary: value?.lastRetentionSummary ?? null,
    notificationFlags: {
      dailyReady: value?.notificationFlags?.dailyReady !== false,
      streakAtRisk: value?.notificationFlags?.streakAtRisk === true,
      comebackAvailable: value?.notificationFlags?.comebackAvailable === true,
    },
  };
}

export function evaluateRetentionAfterGame(current: RetentionState, input: RetentionGameInput) {
  const today = input.dateKey ?? getDayKeyUTC();
  const safeAccuracy = Math.max(0, Math.min(1, Number(input.accuracy) || 0));
  const normalized = normalizeRetentionState(current);
  const gap = daysBetween(normalized.lastPlayedDate, today);
  const isSameDay = gap === 0;
  const isNextDay = gap === 1;
  const missedDays = gap !== null && gap > 1 ? gap - 1 : 0;

  const nextPlayStreak = isSameDay
    ? normalized.playStreak
    : isNextDay
    ? normalized.playStreak + 1
    : 1;

  const claimed = new Set(normalized.claimedStreakMilestones);
  let reward = emptyReward();
  const reasons: string[] = [];

  const milestoneReward = STREAK_MILESTONE_REWARDS[nextPlayStreak];
  if (!isSameDay && milestoneReward && !claimed.has(nextPlayStreak)) {
    reward = addReward(reward, milestoneReward);
    claimed.add(nextPlayStreak);
    reasons.push(`${nextPlayStreak}-day play streak milestone`);
  }

  if (missedDays >= 2) {
    reward = addReward(reward, { xp: 30, coins: 50, gems: 0, tickets: 1 });
    reasons.push("comeback bonus");
  }

  const previousAccuracies = normalized.recentAccuracies;
  const previousAverage = previousAccuracies.length
    ? previousAccuracies.reduce((sum, n) => sum + n, 0) / previousAccuracies.length
    : null;

  if (previousAverage !== null && safeAccuracy >= previousAverage + 0.08) {
    reward = addReward(reward, { xp: 25, coins: 25, gems: 0, tickets: 0 });
    reasons.push("performance improved");
  }

  if (input.won && safeAccuracy >= 0.9) {
    reward = addReward(reward, { xp: 15, coins: 10, gems: 0, tickets: 0 });
    reasons.push("high focus run");
  }

  const recentAccuracies = [...previousAccuracies, safeAccuracy].slice(-8);
  const bestAccuracy = Math.max(normalized.bestAccuracy, safeAccuracy);
  const hasReward = reward.xp > 0 || reward.coins > 0 || reward.gems > 0 || reward.tickets > 0;

  const nextState: RetentionState = {
    playStreak: nextPlayStreak,
    bestPlayStreak: Math.max(normalized.bestPlayStreak, nextPlayStreak),
    lastPlayedDate: today,
    bestAccuracy,
    recentAccuracies,
    claimedStreakMilestones: Array.from(claimed).sort((a, b) => a - b),
    lastRetentionSummary: hasReward
      ? {
          title: reasons.includes("performance improved") ? "You improved" : reasons.includes("comeback bonus") ? "Welcome back" : "Momentum bonus",
          message: reasons.join(" • "),
          reward,
          reasons,
        }
      : null,
    notificationFlags: {
      dailyReady: false,
      streakAtRisk: false,
      comebackAvailable: false,
    },
  };

  return { nextState, reward, hasReward };
}

export function getNextPlayStreakMilestone(playStreak: number) {
  const safe = Math.max(0, Math.floor(playStreak || 0));
  return [3, 7, 14, 30].find((milestone) => milestone > safe) ?? 30;
}



