// powerUpStore.ts
// ★ FULLY SAFE VERSION — ZERO ASYNCSTORAGE CRASHES ★

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";

export const usePowerUpStore = create(
  persist(
    (set, get) => ({
      // -----------------------------------------------------
      // PLAYER OWNED POWERUPS (JSON SAFE)
      // -----------------------------------------------------
      inventory: {
        doubleXP: 0,
        skipQuestion: 0,
        revealAnswer: 0,
      },

      // -----------------------------------------------------
      // ADD POWERUP
      // -----------------------------------------------------
      addPowerUp: (type, amount = 1) => {
        set((state) => ({
          inventory: {
            ...state.inventory,
            [type]: (state.inventory[type] || 0) + amount,
          },
        }));
      },

      // -----------------------------------------------------
      // USE POWERUP
      // -----------------------------------------------------
      usePowerUp: (type) => {
        const current = get().inventory[type] || 0;
        if (current <= 0) return;

        set((state) => ({
          inventory: {
            ...state.inventory,
            [type]: current - 1,
          },
        }));
      },

      // -----------------------------------------------------
      // RESET ALL POWERUPS
      // -----------------------------------------------------
      resetPowerUps: () =>
        set({
          inventory: {
            doubleXP: 0,
            skipQuestion: 0,
            revealAnswer: 0,
          },
        }),
    }),

    // -----------------------------------------------------
    // SAFE PERSISTENCE CONFIG
    // -----------------------------------------------------
    {
      name: "powerups-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        inventory: state.inventory,
      }),
    }
  )
);


