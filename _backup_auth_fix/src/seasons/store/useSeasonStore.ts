import { create } from "zustand";
import {
  loadOrCreateSeason,
  updateSeason,
  PlayerSeason,
} from "../seasonService";
import { CURRENT_SEASON } from "../seasonDefinitions";
import { resetSeasonForUser } from "../seasonResetService";
import { usePlayerStore } from "@/store/usePlayerStore";

/**
 * =========================
 * SEASON REWARD DEFINITIONS
 * =========================
 */

type SeasonReward = {
  coins: number;
};

const SEASON_REWARDS: Record<number, SeasonReward> = {
  1: { coins: 50 },
  2: { coins: 100 },
  3: { coins: 200 },
  4: { coins: 400 },
};

/**
 * =========================
 * STORE STATE
 * =========================
 */

type SeasonState = {
  season: PlayerSeason | null;
  loading: boolean;
  ended: boolean;

  /** transient UI signal */
  justLeveledUpTier: number | null;

  loadSeason: (uid: string) => Promise<void>;
  addSeasonXp: (uid: string, amount: number) => Promise<void>;
  claimSeasonReward: (uid: string, tier: number) => Promise<void>;
  resetSeason: (uid: string) => Promise<void>;
};

/**
 * =========================
 * STORE IMPLEMENTATION
 * =========================
 */

export const useSeasonStore = create<SeasonState>((set, get) => ({
  season: null,
  loading: false,
  ended: false,
  justLeveledUpTier: null,

  /**
   * Load or create current season
   */
  loadSeason: async (uid) => {
    set({ loading: true });
    const season = await loadOrCreateSeason(uid);
    set({
      season,
      loading: false,
      ended: false,
      justLeveledUpTier: null,
    });
  },

  /**
   * Add Season XP and recalculate tier
   */
  addSeasonXp: async (uid, amount) => {
    const state = get();
    const season = state.season;
    if (!season || state.ended) return;

    const prevTier = season.tier;
    const newXp = season.xp + amount;

    let newTier = season.tier;
    CURRENT_SEASON.tiers.forEach((t, index) => {
      if (newXp >= t.xp) {
        newTier = index + 1;
      }
    });

    const leveledUp = newTier > prevTier;

    const updatedSeason: PlayerSeason = {
      ...season,
      xp: newXp,
      tier: newTier,
    };

    set({
      season: updatedSeason,
      justLeveledUpTier: leveledUp ? newTier : null,
    });

    await updateSeason(uid, {
      xp: newXp,
      tier: newTier,
    });

    // auto-clear UI flag (next tick)
    if (leveledUp) {
      setTimeout(() => {
        if (get().justLeveledUpTier === newTier) {
          set({ justLeveledUpTier: null });
        }
      }, 0);
    }
  },

  /**
   * Claim reward for a reached season tier (ONE-TIME)
   */
  claimSeasonReward: async (uid, tier) => {
    const state = get();
    const season = state.season;
    if (!season) return;

    if (tier > season.tier) return;
    if (season.claimedTiers.includes(tier)) return;

    const reward = SEASON_REWARDS[tier];
    if (!reward) return;

    // Apply reward (coins)
    usePlayerStore.getState().addCoins(reward.coins);

    const updatedClaimedTiers = [...season.claimedTiers, tier];

    const updatedSeason: PlayerSeason = {
      ...season,
      claimedTiers: updatedClaimedTiers,
    };

    set({ season: updatedSeason });

    await updateSeason(uid, {
      claimedTiers: updatedClaimedTiers,
    });
  },

  /**
   * Reset season ONCE after it ends
   */
  resetSeason: async (uid) => {
    const state = get();
    if (state.ended) return;

    await resetSeasonForUser(uid);

    set({
      season: {
        seasonId: CURRENT_SEASON.id,
        xp: 0,
        tier: 0,
        claimedTiers: [],
      } as PlayerSeason,
      ended: true,
      justLeveledUpTier: null,
    });
  },
}));
