import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePlayerStore } from "./usePlayerStore";
import { useArenaEconomyStore } from "@/arena/store/useArenaEconomyStore";
import { getDayKeyUTC } from "@/economy/economyRules";

// --------------------------------------------------
// TYPES
// --------------------------------------------------
type DailyRewardState = {
  lastClaimDay: string | null;
  streak: number;

  canClaim: () => boolean;
  claim: () => boolean;
  syncFromPlayerDaily: (daily: { lastClaimDate: string | null; streak: number }) => void;
};

function parseDayKey(day: string) {
  return new Date(`${day}T00:00:00.000Z`);
}

// --------------------------------------------------
// STORE
// --------------------------------------------------
export const useDailyRewardStore = create<DailyRewardState>()(
  persist(
    (set, get) => ({
      lastClaimDay: null,
      streak: 0,

      syncFromPlayerDaily: (daily) => {
        set({
          lastClaimDay: daily.lastClaimDate,
          streak: Math.max(0, Math.floor(daily.streak || 0)),
        });
      },

      canClaim: () => {
        const today = getDayKeyUTC();
        return get().lastClaimDay !== today;
      },

      claim: () => {
        const today = getDayKeyUTC();
        const last = get().lastClaimDay;

        if (last === today) return false;

        let newStreak = 1;

        if (last) {
          const diffDays = Math.round(
            (parseDayKey(today).getTime() - parseDayKey(last).getTime()) / 86400000
          );

          if (diffDays === 1) {
            newStreak = get().streak + 1;
          } else {
            newStreak = 1;
          }
        }

        if (newStreak > 7) newStreak = 1;

        // rewards
        usePlayerStore.getState().addCoins(100);
        useArenaEconomyStore.getState().refillPowerCharges(1);

        set({
          lastClaimDay: today,
          streak: newStreak,
        });

        return true;
      },
    }),
    {
      name: "daily-reward-store",
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);



