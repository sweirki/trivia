// seasonStore.ts
// ★ FULLY SAFE SEASON STORE — NO ASYNCSTORAGE CRASHES ★

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";

// -----------------------------------------------------
// TYPES
// -----------------------------------------------------
type SeasonState = {
  seasonNumber: number;
  xpThisSeason: number;
  gamesPlayed: number;
  rewardsClaimed: string[];

  addSeasonXP: (amount: number) => void;
  incGamesPlayed: () => void;
  claimReward: (id: string) => void;
  resetSeason: () => void;
};

// -----------------------------------------------------
// STORE
// -----------------------------------------------------
export const useSeasonStore = create<SeasonState>()(
  persist(
    (set, get) => ({
      // SEASON STATE (JSON-SAFE)
      seasonNumber: 1,
      xpThisSeason: 0,
      gamesPlayed: 0,
      rewardsClaimed: [],

      // ADD XP
      addSeasonXP: (amount) => {
        set((state) => ({
          xpThisSeason: state.xpThisSeason + amount,
        }));
      },

      // INCREMENT GAMES PLAYED
      incGamesPlayed: () => {
        set((state) => ({
          gamesPlayed: state.gamesPlayed + 1,
        }));
      },

      // CLAIM REWARD
      claimReward: (id) => {
        if (get().rewardsClaimed.includes(id)) return;
        set((state) => ({
          rewardsClaimed: [...state.rewardsClaimed, id],
        }));
      },

      // RESET SEASON
      resetSeason: () =>
        set({
          seasonNumber: get().seasonNumber + 1,
          xpThisSeason: 0,
          gamesPlayed: 0,
          rewardsClaimed: [],
        }),
    }),
    {
      name: "season-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        seasonNumber: state.seasonNumber,
        xpThisSeason: state.xpThisSeason,
        gamesPlayed: state.gamesPlayed,
        rewardsClaimed: state.rewardsClaimed,
      }),
    }
  )
);
