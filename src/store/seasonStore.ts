// seasonStore.ts
// ★ FULLY SAFE SEASON STORE — NO ASYNCSTORAGE CRASHES ★

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";

export const useSeasonStore = create(
  persist(
    (set, get) => ({
      // -----------------------------------------------------
      // SEASON STATE (JSON-SAFE)
      // -----------------------------------------------------
      seasonNumber: 1,
      xpThisSeason: 0,
      gamesPlayed: 0,
      rewardsClaimed: [], // ["reward1", "reward2"]

      // -----------------------------------------------------
      // ADD XP
      // -----------------------------------------------------
      addSeasonXP: (amount) => {
        set((state) => ({
          xpThisSeason: state.xpThisSeason + amount,
        }));
      },

      // -----------------------------------------------------
      // INCREMENT GAMES PLAYED
      // -----------------------------------------------------
      incGamesPlayed: () => {
        set((state) => ({
          gamesPlayed: state.gamesPlayed + 1,
        }));
      },

      // -----------------------------------------------------
      // CLAIM REWARD
      // -----------------------------------------------------
      claimReward: (id) => {
        if (get().rewardsClaimed.includes(id)) return;
        set((state) => ({
          rewardsClaimed: [...state.rewardsClaimed, id],
        }));
      },

      // -----------------------------------------------------
      // RESET SEASON (when new season starts)
      // -----------------------------------------------------
      resetSeason: () =>
        set({
          seasonNumber: get().seasonNumber + 1,
          xpThisSeason: 0,
          gamesPlayed: 0,
          rewardsClaimed: [],
        }),
    }),

    // -----------------------------------------------------
    // SAFE PERSISTENCE CONFIG
    // -----------------------------------------------------
    {
      name: "season-store",
      storage: createJSONStorage(() => AsyncStorage),

      // ONLY persist JSON-safe fields
      partialize: (state) => ({
        seasonNumber: state.seasonNumber,
        xpThisSeason: state.xpThisSeason,
        gamesPlayed: state.gamesPlayed,
        rewardsClaimed: state.rewardsClaimed,
      }),
    }
  )
);


