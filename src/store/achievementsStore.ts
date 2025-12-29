// /store/achievementsStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePlayerStore } from "./usePlayerStore";

// Achievement format:
// id: { progress, target, unlocked, rewardXP, rewardCoins, rewardGems, category }
export interface Achievement {
  id: string;
  progress: number;
  target: number;
  unlocked: boolean;
  rewardXP: number;
  rewardCoins: number;
  rewardGems: number;
  category: string | null;
}

export interface AchievementsStoreState {
  achievements: Record<string, Achievement>;
  unlocked: string[];

  registerAchievement: (
    id: string,
    target: number,
    rewardXP?: number,
    rewardCoins?: number,
    rewardGems?: number,
    category?: string | null
  ) => void;

  addProgress: (id: string, amount?: number, category?: string | null) => void;
  unlockAchievement: (id: string) => void;
  resetAchievements: () => void;
}

export const useAchievementsStore = create<AchievementsStoreState>()(

  persist(
    (set, get) => ({

      achievements: {},

      unlocked: [],

      // Register a new achievement if missing
      registerAchievement: (id, target, rewardXP = 0, rewardCoins = 0, rewardGems = 0, category = null) => {
        const state = get();
        if (state.achievements[id]) return;

        set({
          achievements: {
            ...state.achievements,
            [id]: {
              id,
              progress: 0,
              target,
              unlocked: false,
              rewardXP,
              rewardCoins,
              rewardGems,
              category,
            },
          },
        });
      },
      // ---------------------------------------------------------
      // ADD PROGRESS (THE MAIN ENGINE)
      // ---------------------------------------------------------
      addProgress: (id, amount = 1, category = null) => {
        const state = get();
        const player = usePlayerStore.getState();

        const curr = state.achievements[id] || {
          id,
          progress: 0,
          target: 10,
          unlocked: false,
          rewardXP: 0,
          rewardCoins: 0,
          rewardGems: 0,
          category,
        };

        const newProgress = curr.progress + amount;
        const unlockedNow = newProgress >= curr.target;

        set({
          achievements: {
            ...state.achievements,
            [id]: {
              ...curr,
              progress: newProgress,
              unlocked: unlockedNow ? true : curr.unlocked,
            },
          },
        });

        if (unlockedNow && !curr.unlocked) {
          set({
            unlocked: [...new Set([...state.unlocked, id])],
          });

          player.applyReward(
            curr.rewardXP,
            curr.rewardCoins,
            curr.rewardGems
          );
        }
      },

      // ---------------------------------------------------------
      // FORCE UNLOCK (Admin / System event)
      // ---------------------------------------------------------
      unlockAchievement: (id) => {
        const state = get();
        const curr = state.achievements[id];
        if (!curr || curr.unlocked) return;

        const player = usePlayerStore.getState();

        set({
          achievements: {
            ...state.achievements,
            [id]: {
              ...curr,
              unlocked: true,
            },
          },
          unlocked: [...new Set([...state.unlocked, id])],
        });

        player.applyReward(
          curr.rewardXP || 0,
          curr.rewardCoins || 0,
          curr.rewardGems || 0
        );
      },
      // ---------------------------------------------------------
      // RESET ALL ACHIEVEMENTS
      // ---------------------------------------------------------
      resetAchievements: () => {
        set({
          achievements: {},
          unlocked: [],
        });
      },
    }),

    // ---------------------------------------------------------
    // SAFE PERSISTENCE (JSON ONLY)
    // ---------------------------------------------------------
    {
      name: "achievements-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        achievements: state.achievements,
        unlocked: state.unlocked,
      }),
      version: 1,
    }
  )
);


