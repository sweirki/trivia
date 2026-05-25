// historyStore.ts
// ★ SAFE + CLEAN + JSON STORAGE ★

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";

// -----------------------------------------------------
// TYPES
// -----------------------------------------------------
export type HistoryEntry = {
  mode: string;
  category?: string;
  score?: number;
  totalQuestions?: number;
  correctCount?: number;
  accuracy?: number;
  won?: boolean;
  xp?: number;
  coins?: number;
  date: number;
};

type HistoryState = {
  history: HistoryEntry[];
  addResult: (
    entry: Omit<HistoryEntry, "date"> & { date?: number }
  ) => void;
  clearHistory: () => void;
};

// -----------------------------------------------------
// STORE
// -----------------------------------------------------
export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      // GAME HISTORY ARRAY (JSON-SAFE)
      history: [],

      // ADD GAME RESULT
      addResult: (entry) => {
        const safeEntry: HistoryEntry = {
          ...entry,
          date: entry.date ?? Date.now(),
        };

        set((state) => ({
          history: [...state.history, safeEntry].slice(-50),
        }));
      },

      // CLEAR HISTORY
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "arena-history-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        history: state.history,
      }),
    }
  )
);




