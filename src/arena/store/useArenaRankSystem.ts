import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  buildArenaSeasonEndsAt,
  getArenaSeasonReward,
  getRankLabel,
} from "@/arena/season/arenaSeasonPrestige";
import { useArenaEconomyStore } from "@/arena/store/useArenaEconomyStore";

// ------------------------------------
// TYPES
// ------------------------------------
export interface RankInfo {
  league: string;
  division: number | null;
  minSR: number;
  maxSR: number;
  icon: string;
}

export type RankedIntegrityReason = {
  label: string;
  sr: number;
  tone: "good" | "bad" | "neutral";
};

export type RankedIntegrityContext = {
  playerScore: number;
  opponentScore: number;
  questionsAnswered: number;
};

export type RankedIntegrityBreakdown = {
  outcome: "win" | "loss" | "draw";
  srBefore: number;
  srAfter: number;
  srDelta: number;
  reasons: RankedIntegrityReason[];
  closeMatch: boolean;
  perfectMatch: boolean;
  lowRankProtection: boolean;
  promotionMatch: boolean;
  shieldConsumed: boolean;
  demotionPrevented: boolean;
};

export type ArenaSeasonSnapshot = {
  season: number;
  finalSR: number;
  highestSR: number;
  highestRankLabel: string;
  rewardTitle: string;
  rewardLabel: string;
  tokenReward: number;
  softResetSR: number;
  newSeason: number;
  createdAt: number;
  claimedAt: number | null;
};

interface ArenaRankState {
  sr: number;
  rank: RankInfo;
  winStreak: number;
  season: number;
  seasonStartedAt: number;
  seasonEndsAt: number;
  highestSR: number;
  highestRank: RankInfo;
  lastSeasonSnapshot: ArenaSeasonSnapshot | null;
  seasonArchive: ArenaSeasonSnapshot[];
  lastRankedBreakdown: RankedIntegrityBreakdown | null;

  addWin: (
    opponentSR: number,
    context?: RankedIntegrityContext,
  ) => RankedIntegrityBreakdown;
  addLoss: (
    opponentSR: number,
    closeMatch?: boolean,
    context?: RankedIntegrityContext,
  ) => RankedIntegrityBreakdown;
  addDraw: (
    opponentSR: number,
    context?: RankedIntegrityContext,
  ) => RankedIntegrityBreakdown;
  resetSeason: () => ArenaSeasonSnapshot;
  claimLastSeasonReward: () => boolean;
  dismissLastSeasonSnapshot: () => void;
}

// ------------------------------------
// RANK TABLE
// ------------------------------------
export const RANK_TABLE: RankInfo[] = [
  { league: "Bronze", division: 3, minSR: 0, maxSR: 133, icon: "bronze3" },
  { league: "Bronze", division: 2, minSR: 134, maxSR: 266, icon: "bronze2" },
  { league: "Bronze", division: 1, minSR: 267, maxSR: 399, icon: "bronze1" },
  { league: "Silver", division: 3, minSR: 400, maxSR: 533, icon: "silver3" },
  { league: "Silver", division: 2, minSR: 534, maxSR: 666, icon: "silver2" },
  { league: "Silver", division: 1, minSR: 667, maxSR: 799, icon: "silver1" },
  { league: "Gold", division: 3, minSR: 800, maxSR: 933, icon: "gold3" },
  { league: "Gold", division: 2, minSR: 934, maxSR: 1066, icon: "gold2" },
  { league: "Gold", division: 1, minSR: 1067, maxSR: 1199, icon: "gold1" },
  { league: "Platinum", division: 3, minSR: 1200, maxSR: 1333, icon: "plat3" },
  { league: "Platinum", division: 2, minSR: 1334, maxSR: 1466, icon: "plat2" },
  { league: "Platinum", division: 1, minSR: 1467, maxSR: 1599, icon: "plat1" },
  { league: "Diamond", division: 3, minSR: 1600, maxSR: 1733, icon: "diamond3" },
  { league: "Diamond", division: 2, minSR: 1734, maxSR: 1866, icon: "diamond2" },
  { league: "Diamond", division: 1, minSR: 1867, maxSR: 1999, icon: "diamond1" },
  { league: "Master", division: null, minSR: 2000, maxSR: 2399, icon: "master" },
  { league: "Grandmaster", division: null, minSR: 2400, maxSR: 2699, icon: "grandmaster" },
  { league: "Legendary", division: null, minSR: 2700, maxSR: 9999, icon: "legendary" },
];

// ------------------------------------
// PURE HELPERS
// ------------------------------------
const getRankFromSR = (sr: number): RankInfo => {
  return RANK_TABLE.find((r) => sr >= r.minSR && sr <= r.maxSR) || RANK_TABLE[0];
};

function getPeakForSR(
  currentPeak: { highestSR: number; highestRank: RankInfo },
  nextSR: number,
) {
  if (nextSR <= currentPeak.highestSR) return currentPeak;
  return { highestSR: nextSR, highestRank: getRankFromSR(nextSR) };
}

const safeQuestionsAnswered = (context?: RankedIntegrityContext) =>
  Math.max(1, context?.questionsAnswered ?? 7);

const isPerfectMatch = (context?: RankedIntegrityContext) =>
  !!context && context.playerScore >= safeQuestionsAnswered(context);

const isCloseMatch = (context?: RankedIntegrityContext) =>
  !!context && Math.abs(context.playerScore - context.opponentScore) <= 1;

const getNextRankForSR = (sr: number): RankInfo | null => {
  const currentRank = getRankFromSR(sr);
  const index = RANK_TABLE.findIndex(
    (rank) =>
      rank.league === currentRank.league &&
      rank.division === currentRank.division &&
      rank.minSR === currentRank.minSR,
  );

  if (index < 0 || index >= RANK_TABLE.length - 1) return null;
  return RANK_TABLE[index + 1];
};

const getSRToNextRank = (sr: number) => {
  const nextRank = getNextRankForSR(sr);
  if (!nextRank) return null;
  return Math.max(0, nextRank.minSR - sr);
};

function buildBreakdown(params: {
  outcome: "win" | "loss" | "draw";
  srBefore: number;
  srAfter: number;
  reasons: RankedIntegrityReason[];
  context?: RankedIntegrityContext;
  lowRankProtection?: boolean;
  promotionMatch?: boolean;
  shieldConsumed?: boolean;
  demotionPrevented?: boolean;
}): RankedIntegrityBreakdown {
  const srDelta = params.srAfter - params.srBefore;
  return {
    outcome: params.outcome,
    srBefore: params.srBefore,
    srAfter: params.srAfter,
    srDelta,
    reasons: params.reasons,
    closeMatch: isCloseMatch(params.context),
    perfectMatch: isPerfectMatch(params.context),
    lowRankProtection: !!params.lowRankProtection,
    promotionMatch: !!params.promotionMatch,
    shieldConsumed: !!params.shieldConsumed,
    demotionPrevented: !!params.demotionPrevented,
  };
}

function buildSeasonSnapshot(state: ArenaRankState, now = Date.now()): ArenaSeasonSnapshot {
  const reward = getArenaSeasonReward(state.highestSR);
  const softResetSR = Math.max(0, Math.floor(state.sr * 0.65));

  return {
    season: state.season,
    finalSR: state.sr,
    highestSR: state.highestSR,
    highestRankLabel: getRankLabel(state.highestRank),
    rewardTitle: reward.title,
    rewardLabel: reward.rewardLabel,
    tokenReward: reward.tokenReward,
    softResetSR,
    newSeason: state.season + 1,
    createdAt: now,
    claimedAt: null,
  };
}

const initialStartedAt = Date.now();

// ------------------------------------
// STORE
// ------------------------------------
export const useArenaRankSystem = create<ArenaRankState>()(
  persist(
    (set, get) => ({
      sr: 0,
      rank: RANK_TABLE[0],
      winStreak: 0,
      season: 1,
      seasonStartedAt: initialStartedAt,
      seasonEndsAt: buildArenaSeasonEndsAt(initialStartedAt),
      highestSR: 0,
      highestRank: RANK_TABLE[0],
      lastSeasonSnapshot: null,
      seasonArchive: [],
      lastRankedBreakdown: null,

      addWin: (opponentSR: number, context?: RankedIntegrityContext) => {
        const { sr, winStreak } = get();
        const newWinStreak = winStreak + 1;
        const srToNextBefore = getSRToNextRank(sr);
        const promotionMatch = srToNextBefore !== null && srToNextBefore <= 28;
        const reasons: RankedIntegrityReason[] = [
          {
            label: promotionMatch ? "Promotion match won" : "Victory",
            sr: 18,
            tone: "good",
          },
        ];

        let gain = 18;

        if (promotionMatch) {
          gain += 2;
          reasons.push({ label: "Promotion pressure handled", sr: 2, tone: "good" });
        }

        if (newWinStreak >= 3) {
          const streakBonus = newWinStreak >= 5 ? 5 : 2;
          gain += streakBonus;
          reasons.push({ label: `${newWinStreak} win streak`, sr: streakBonus, tone: "good" });
        }

        if (opponentSR > sr) {
          gain += 4;
          reasons.push({ label: "Underdog win", sr: 4, tone: "good" });
        }

        if (isPerfectMatch(context)) {
          gain += 6;
          reasons.push({ label: "Perfect match", sr: 6, tone: "good" });
        }

        if (context && context.playerScore - context.opponentScore >= 3) {
          gain += 3;
          reasons.push({ label: "Dominant scoreline", sr: 3, tone: "good" });
        } else if (isCloseMatch(context)) {
          gain += 2;
          reasons.push({ label: "Clutch finish", sr: 2, tone: "good" });
        }

        const newSR = sr + gain;
        const breakdown = buildBreakdown({
          outcome: "win",
          srBefore: sr,
          srAfter: newSR,
          reasons,
          context,
          promotionMatch,
        });
        const peak = getPeakForSR(get(), newSR);

        set({
          sr: newSR,
          rank: getRankFromSR(newSR),
          winStreak: newWinStreak,
          highestSR: peak.highestSR,
          highestRank: peak.highestRank,
          lastRankedBreakdown: breakdown,
        });

        return breakdown;
      },

      addLoss: (opponentSR: number, closeMatch = false, context?: RankedIntegrityContext) => {
        const { sr } = get();
        const reasons: RankedIntegrityReason[] = [];
        const lowRankProtection = sr < 400;
        const rankBefore = getRankFromSR(sr);
        const srToNextBefore = getSRToNextRank(sr);
        const promotionMatch = srToNextBefore !== null && srToNextBefore <= 28;

        let loss = lowRankProtection ? 8 : 16;
        reasons.push({
          label: lowRankProtection ? "Protected division loss" : "Defeat",
          sr: -loss,
          tone: "bad",
        });

        if (opponentSR < sr) {
          loss += 4;
          reasons.push({ label: "Favored matchup penalty", sr: -4, tone: "bad" });
        }

        if (opponentSR > sr) {
          loss = Math.max(4, loss - 3);
          reasons.push({ label: "Higher rival mitigation", sr: 3, tone: "good" });
        }

        const finalCloseMatch = closeMatch || isCloseMatch(context);
        if (finalCloseMatch) {
          loss = Math.max(4, loss - 5);
          reasons.push({ label: "Close loss reduced", sr: 5, tone: "good" });
        }

        if (lowRankProtection) {
          loss = Math.min(loss, 8);
          reasons.push({ label: "Bronze/Silver protection", sr: 0, tone: "neutral" });
        }

        const rawNewSR = Math.max(0, sr - loss);
        const shieldConsumed = !lowRankProtection && rankBefore.minSR > 0 && rawNewSR < rankBefore.minSR;
        const newSR = shieldConsumed ? rankBefore.minSR : rawNewSR;

        if (shieldConsumed) {
          reasons.push({ label: "Division shield consumed", sr: newSR - rawNewSR, tone: "good" });
        }

        const breakdown = buildBreakdown({
          outcome: "loss",
          srBefore: sr,
          srAfter: newSR,
          reasons,
          context,
          lowRankProtection,
          promotionMatch,
          shieldConsumed,
          demotionPrevented: shieldConsumed,
        });

        set({
          sr: newSR,
          rank: getRankFromSR(newSR),
          winStreak: 0,
          lastRankedBreakdown: breakdown,
        });

        return breakdown;
      },

      addDraw: (opponentSR: number, context?: RankedIntegrityContext) => {
        const { sr } = get();
        const reasons: RankedIntegrityReason[] = [{ label: "Draw protection", sr: 0, tone: "neutral" }];
        let gain = 0;

        if (opponentSR > sr) {
          gain += 2;
          reasons.push({ label: "Held off higher rival", sr: 2, tone: "good" });
        }

        if (isPerfectMatch(context)) {
          gain += 1;
          reasons.push({ label: "Perfect draw", sr: 1, tone: "good" });
        }

        const newSR = sr + gain;
        const breakdown = buildBreakdown({
          outcome: "draw",
          srBefore: sr,
          srAfter: newSR,
          reasons,
          context,
        });
        const peak = getPeakForSR(get(), newSR);

        set({
          sr: newSR,
          rank: getRankFromSR(newSR),
          winStreak: 0,
          highestSR: peak.highestSR,
          highestRank: peak.highestRank,
          lastRankedBreakdown: breakdown,
        });

        return breakdown;
      },

      resetSeason: () => {
        const state = get();
        const nextStartedAt = Date.now();
        const snapshot = buildSeasonSnapshot(state, nextStartedAt);
        const newRank = getRankFromSR(snapshot.softResetSR);

        set({
          sr: snapshot.softResetSR,
          rank: newRank,
          winStreak: 0,
          season: snapshot.newSeason,
          seasonStartedAt: nextStartedAt,
          seasonEndsAt: buildArenaSeasonEndsAt(nextStartedAt),
          highestSR: snapshot.softResetSR,
          highestRank: newRank,
          lastSeasonSnapshot: snapshot,
          seasonArchive: [snapshot, ...state.seasonArchive].slice(0, 8),
          lastRankedBreakdown: null,
        });

        return snapshot;
      },

      claimLastSeasonReward: () => {
        const snapshot = get().lastSeasonSnapshot;
        if (!snapshot || snapshot.claimedAt) return false;

        if (snapshot.tokenReward > 0) {
          useArenaEconomyStore.getState().earnArenaTokens(snapshot.tokenReward);
        }

        const claimedSnapshot = { ...snapshot, claimedAt: Date.now() };
        set((state) => ({
          lastSeasonSnapshot: claimedSnapshot,
          seasonArchive: state.seasonArchive.map((item) =>
            item.createdAt === snapshot.createdAt ? claimedSnapshot : item,
          ),
        }));

        return true;
      },

      dismissLastSeasonSnapshot: () => {
        set({ lastSeasonSnapshot: null });
      },
    }),
    {
      name: "arena-rank-system-store",
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sr: state.sr,
        rank: state.rank,
        winStreak: state.winStreak,
        season: state.season,
        seasonStartedAt: state.seasonStartedAt,
        seasonEndsAt: state.seasonEndsAt,
        highestSR: state.highestSR,
        highestRank: state.highestRank,
        lastSeasonSnapshot: state.lastSeasonSnapshot,
        seasonArchive: state.seasonArchive,
        lastRankedBreakdown: state.lastRankedBreakdown,
      }),
    },
  ),
);
