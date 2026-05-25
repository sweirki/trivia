import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type RivalMatchOutcome = "win" | "loss" | "draw";

export type RivalMatchRecord = {
  id: string;
  ts: number;
  rivalId?: string;
  rivalName: string;
  rivalTitle?: string;
  rivalStyle?: string;
  outcome: RivalMatchOutcome;
  playerScore: number;
  rivalScore: number;
  srDelta: number;
};

export type RivalProfileSummary = {
  rivalName: string;
  rivalTitle?: string;
  rivalStyle?: string;
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  lastOutcome?: RivalMatchOutcome;
  lastPlayedAt?: number;
};

type ArenaRivalHistoryState = {
  records: RivalMatchRecord[];
  recordMatch: (record: Omit<RivalMatchRecord, "id" | "ts">) => void;
  getRivalProfile: (rivalName?: string | null) => RivalProfileSummary | null;
  clearRivalHistory: () => void;
};

const MAX_RECORDS = 40;

const uid = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

function summarize(records: RivalMatchRecord[], rivalName?: string | null): RivalProfileSummary | null {
  if (!rivalName) return null;

  const matches = records.filter((record) => record.rivalName === rivalName);
  if (!matches.length) return null;

  const latest = matches[0];

  return {
    rivalName,
    rivalTitle: latest.rivalTitle,
    rivalStyle: latest.rivalStyle,
    matches: matches.length,
    wins: matches.filter((record) => record.outcome === "win").length,
    losses: matches.filter((record) => record.outcome === "loss").length,
    draws: matches.filter((record) => record.outcome === "draw").length,
    lastOutcome: latest.outcome,
    lastPlayedAt: latest.ts,
  };
}

export const useArenaRivalHistoryStore = create<ArenaRivalHistoryState>()(
  persist(
    (set, get) => ({
      records: [],

      recordMatch: (record) => {
        const entry: RivalMatchRecord = {
          id: uid(),
          ts: Date.now(),
          ...record,
        };

        set({
          records: [entry, ...get().records].slice(0, MAX_RECORDS),
        });
      },

      getRivalProfile: (rivalName) => summarize(get().records, rivalName),

      clearRivalHistory: () => set({ records: [] }),
    }),
    {
      name: "arena-rival-history-store",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
