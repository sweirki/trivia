import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type SurvivalHistoryItem = {
  id: string;
  ts: number;
  score: number;
};

type SurvivalHistoryState = {
  runs: SurvivalHistoryItem[];
  addRun: (score: number) => void;
  clearRuns: () => void;
};

const MAX_RUNS = 10;

const uid = () =>
  `${Date.now()}_${Math.random().toString(16).slice(2)}`;

export const useSurvivalHistoryStore = create<SurvivalHistoryState>()(
  persist(
    (set, get) => ({
      runs: [],

      addRun: (score) => {
        const entry: SurvivalHistoryItem = {
          id: uid(),
          ts: Date.now(),
          score,
        };

        set({
          runs: [entry, ...get().runs].slice(0, MAX_RUNS),
        });
      },

      clearRuns: () => set({ runs: [] }),
    }),
    {
      name: "survival-history-store",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

