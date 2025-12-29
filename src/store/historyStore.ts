// historyStore.ts
// ★ SAFE + CLEAN + JSON STORAGE ★

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";

export const useHistoryStore = create(
  persist(
    (set, get) => ({
      // -----------------------------------------------------
      // GAME HISTORY ARRAY (JSON-SAFE)
      // -----------------------------------------------------
      history: [],  // [{ mode, category, score, date }, ...]

      // -----------------------------------------------------
      // ADD GAME RESULT
      // -----------------------------------------------------
      addResult: (entry) => {
        const safeEntry = {
          ...entry,
          date: entry.date || Date.now(),
        };

        set((state) => ({
          history: [...state.history, safeEntry],
        }));
      },

      // -----------------------------------------------------
      // CLEAR HISTORY
      // -----------------------------------------------------
      clearHistory: () => set({ history: [] }),
    }),

    // -----------------------------------------------------
    // SAFE PERSISTENCE
    // -----------------------------------------------------
    {
      name: "arena-history-store",
      storage: createJSONStorage(() => AsyncStorage),

      // Persist ONLY JSON-safe fields
      partialize: (state) => ({
        history: state.history,
      }),
    }
  )
);


