// src/arena/survival/useSurvivalArenaStore.ts

import { create } from "zustand";

import { SurvivalRun } from "./survivalTypes";
import {
  createSurvivalRun,
  extendSurvivalRun,
} from "./survivalMatchmaker";

type SurvivalArenaState = {
  currentRun: SurvivalRun | null;
  history: SurvivalRun[];

 startRun: (questionPool: any[]) => void;
recordCorrect: (questionPool: any[]) => void;

  endRun: () => void;
  resetRun: () => void;
};

export const useSurvivalArenaStore = create<SurvivalArenaState>(
  (set, get) => ({
    currentRun: null,
    history: [],

    startRun: (questionPool) => {
      const run = createSurvivalRun(questionPool);
      set({ currentRun: run });
    },

    recordCorrect: (questionPool) => {
      const run = get().currentRun;
      if (!run || run.status !== "active") return;

      const updatedCount = run.correctCount + 1;

      let updatedRun: SurvivalRun = {
        ...run,
        correctCount: updatedCount,
      };

      // Extend questions when nearing end
      if (updatedRun.questions.length - updatedCount <= 2) {
        updatedRun = extendSurvivalRun(updatedRun, questionPool);
      }

      set({ currentRun: updatedRun });
    },

    endRun: () => {
      const run = get().currentRun;
      if (!run) return;

      const endedRun: SurvivalRun = {
        ...run,
        status: "ended",
        endedAt: Date.now(),
      };

      set((s) => ({
        currentRun: null,
        history: [endedRun, ...s.history],
      }));
    },

    resetRun: () => {
      set({ currentRun: null });
    },
  })
);
