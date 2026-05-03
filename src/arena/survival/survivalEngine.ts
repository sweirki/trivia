// src/arena/survival/survivalEngine.ts

import { useSurvivalArenaStore } from "./useSurvivalArenaStore";

/**
 * Start a survival run
 */
export function startSurvivalGame(questionPool: any[]) {
  const { startRun } = useSurvivalArenaStore.getState();
  startRun(questionPool);
}

/**
 * Called when player answers correctly
 */
export function recordSurvivalCorrect(questionPool: any[]) {
  const { recordCorrect } = useSurvivalArenaStore.getState();
  recordCorrect(questionPool);
}

/**
 * Called immediately on wrong answer
 */
export function finishSurvivalGame() {
  const { endRun } = useSurvivalArenaStore.getState();
  endRun();
}

