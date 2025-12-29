import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePlayerStore } from "@/store/usePlayerStore";

// --------------------------------------------------
// TYPES
// --------------------------------------------------
type ArenaEconomyState = {
  arenaTokens: number;     // skill currency
  powerCharges: number;    // consumable fuel

  // Earn
  earnArenaTokens: (amount: number) => void;
  earnCoins: (amount: number) => void;

  // Spend
  spendArenaTokens: (amount: number) => boolean;
  spendCoins: (amount: number) => boolean;
  spendPowerCharge: () => boolean;

  // Power Charges
  refillPowerCharges: (amount: number) => void;

  // Reset / Admin
  resetArenaEconomy: () => void;
};

// --------------------------------------------------
// CONSTANTS (ANTI-INFLATION GUARDS)
// --------------------------------------------------
const MAX_POWER_CHARGES = 10;
const MAX_ARENA_TOKENS = 9999;

// --------------------------------------------------
// STORE
// --------------------------------------------------
export const useArenaEconomyStore = create<ArenaEconomyState>()(
  persist(
    (set, get) => ({
      arenaTokens: 0,
      powerCharges: 5, // starting fuel

      // --------------------------------
      // EARN
      // --------------------------------
      earnArenaTokens: (amount) => {
        if (amount <= 0) return;

        set((state) => ({
          arenaTokens: Math.min(
            MAX_ARENA_TOKENS,
            state.arenaTokens + amount
          ),
        }));
      },

      earnCoins: (amount) => {
        if (amount <= 0) return;
        usePlayerStore.getState().addCoins(amount);
      },

      // --------------------------------
      // SPEND
      // --------------------------------
      spendArenaTokens: (amount) => {
        if (amount <= 0) return false;
        if (get().arenaTokens < amount) return false;

        set((state) => ({
          arenaTokens: state.arenaTokens - amount,
        }));
        return true;
      },

      spendCoins: (amount) => {
        if (amount <= 0) return false;
        return usePlayerStore.getState().spendCoins(amount);
      },

      spendPowerCharge: () => {
        if (get().powerCharges <= 0) return false;

        set((state) => ({
          powerCharges: state.powerCharges - 1,
        }));
        return true;
      },

      // --------------------------------
      // REFILL
      // --------------------------------
      refillPowerCharges: (amount) => {
        if (amount <= 0) return;

        set((state) => ({
          powerCharges: Math.min(
            MAX_POWER_CHARGES,
            state.powerCharges + amount
          ),
        }));
      },

      // --------------------------------
      // RESET
      // --------------------------------
      resetArenaEconomy: () =>
        set({
          arenaTokens: 0,
          powerCharges: 5,
        }),
    }),
    {
      name: "arena-economy-store",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
