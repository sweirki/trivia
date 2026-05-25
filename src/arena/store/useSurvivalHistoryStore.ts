import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type SurvivalHistoryItem = {
  id: string;
  ts: number;
  score: number;
};

export type SurvivalMilestone = 10 | 20 | 30 | 40;

export type SurvivalRunResult = {
  previousBest: number;
  bestScore: number;
  isPersonalBest: boolean;
  totalRuns: number;
  milestonesUnlocked: SurvivalMilestone[];
};

type SurvivalHistoryState = {
  runs: SurvivalHistoryItem[];
  bestScore: number;
  totalRuns: number;
  unlockedMilestones: SurvivalMilestone[];
  addRun: (score: number) => SurvivalRunResult;
  clearRuns: () => void;
};

const MAX_RUNS = 10;
const MILESTONES: SurvivalMilestone[] = [10, 20, 30, 40];

const uid = () =>
  `${Date.now()}_${Math.random().toString(16).slice(2)}`;

function uniqueMilestones(values: SurvivalMilestone[]) {
  return Array.from(new Set(values)).sort((a, b) => a - b);
}

function getReachedMilestones(score: number) {
  return MILESTONES.filter((milestone) => score >= milestone);
}

export const useSurvivalHistoryStore = create<SurvivalHistoryState>()(
  persist(
    (set, get) => ({
      runs: [],
      bestScore: 0,
      totalRuns: 0,
      unlockedMilestones: [],

      addRun: (score) => {
        const state = get();
        const previousBest = Math.max(
          state.bestScore,
          ...state.runs.map((run) => run.score),
          0
        );
        const reachedMilestones = getReachedMilestones(score);
        const milestonesUnlocked = reachedMilestones.filter(
          (milestone) => !state.unlockedMilestones.includes(milestone)
        );
        const bestScore = Math.max(previousBest, score);
        const totalRuns = state.totalRuns + 1;
        const entry: SurvivalHistoryItem = {
          id: uid(),
          ts: Date.now(),
          score,
        };

        set({
          runs: [entry, ...state.runs].slice(0, MAX_RUNS),
          bestScore,
          totalRuns,
          unlockedMilestones: uniqueMilestones([
            ...state.unlockedMilestones,
            ...reachedMilestones,
          ]),
        });

        return {
          previousBest,
          bestScore,
          isPersonalBest: score > previousBest,
          totalRuns,
          milestonesUnlocked,
        };
      },

      clearRuns: () =>
        set({
          runs: [],
          bestScore: 0,
          totalRuns: 0,
          unlockedMilestones: [],
        }),
    }),
    {
      name: "survival-history-store",
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<SurvivalHistoryState>;
        const runs = Array.isArray(state.runs) ? state.runs : [];
        const bestScore = Math.max(
          Number(state.bestScore ?? 0),
          ...runs.map((run) => Number(run.score || 0)),
          0
        );

        return {
          ...state,
          runs,
          bestScore,
          totalRuns: Number(state.totalRuns ?? runs.length ?? 0),
          unlockedMilestones: uniqueMilestones([
            ...(Array.isArray(state.unlockedMilestones)
              ? state.unlockedMilestones
              : []),
            ...getReachedMilestones(bestScore),
          ]),
        } as SurvivalHistoryState;
      },
    }
  )
);
