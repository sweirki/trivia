import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type RankedMatchHistoryItem = {
  id: string;
  ts: number; // Date.now()
  result: "win" | "loss" | "draw";
  playerScore: number;
  opponentScore: number;
  srBefore: number;
  srAfter: number;
  srDelta: number;
};

type RankedHistoryState = {
  matches: RankedMatchHistoryItem[];
  addMatch: (item: Omit<RankedMatchHistoryItem, "id" | "ts">) => void;
  clearHistory: () => void;
};

const MAX_MATCHES = 10;

const uid = () =>
  `${Date.now()}_${Math.random().toString(16).slice(2)}`;

export const useRankedHistoryStore = create<RankedHistoryState>()(
  persist(
    (set, get) => ({
      matches: [],

      addMatch: (item) => {
        const entry: RankedMatchHistoryItem = {
          id: uid(),
          ts: Date.now(),
          ...item,
        };

        set({
          matches: [entry, ...get().matches].slice(0, MAX_MATCHES),
        });
      },

      clearHistory: () => set({ matches: [] }),
    }),
    {
      name: "ranked-history-store",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

