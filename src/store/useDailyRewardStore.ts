import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePlayerStore } from "./usePlayerStore";
import { useArenaEconomyStore } from "@/arena/store/useArenaEconomyStore";


// --------------------------------------------------
// TYPES
// --------------------------------------------------
type DailyRewardState = {
  lastClaim: number | null;

  canClaim: () => boolean;
  claim: () => boolean;
};

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;

// --------------------------------------------------
// STORE
// --------------------------------------------------
export const useDailyRewardStore = create<DailyRewardState>()(
  persist(
    (set, get) => ({
      lastClaim: null,

      canClaim: () => {
        const last = get().lastClaim;
        if (!last) return true;
        return Date.now() - last >= DAILY_COOLDOWN;
      },

      claim: () => {
        if (!get().canClaim()) return false;

        // ---- GLOBAL DAILY REWARDS ----
        usePlayerStore.getState().addCoins(100);       // coins
        useArenaEconomyStore.getState().refillPowerCharges(1); // arena bonus

        set({ lastClaim: Date.now() });
        return true;
      },
    }),
    {
      name: "daily-reward-store",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

