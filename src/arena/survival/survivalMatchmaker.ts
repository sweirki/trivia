// src/arena/survival/survivalMatchmaker.ts

import { nanoid } from "nanoid/non-secure";

import { SURVIVAL_CONFIG } from "./survivalConstants";
import { SurvivalRun } from "./survivalTypes";

/**
 * Resolve difficulty by progress
 */
function getDifficultyByProgress(
  correctCount: number
): "easy" | "medium" | "hard" {

  if (correctCount < SURVIVAL_CONFIG.RAMP_INTERVAL) return "easy";
  if (correctCount < SURVIVAL_CONFIG.RAMP_INTERVAL * 2) return "medium";
  return "hard";
}

/**
 * Create a new survival run
 */
export function createSurvivalRun(
 questionPool: any[]

): SurvivalRun {
  const initialQuestions = questionPool
    .filter((q) => q.difficulty === "easy")
    .slice(0, SURVIVAL_CONFIG.BASE_BATCH_SIZE);

  return {
    runId: nanoid(),
    questions: initialQuestions,
    correctCount: 0,
    status: "active",
    startedAt: Date.now(),
  };
}

/**
 * Extend an existing survival run with next batch
 */
export function extendSurvivalRun(
  run: SurvivalRun,
  questionPool: any[]

): SurvivalRun {
  const difficulty = getDifficultyByProgress(run.correctCount);

  const nextBatch = questionPool
    .filter((q) => q.difficulty === difficulty)
    .slice(0, SURVIVAL_CONFIG.BASE_BATCH_SIZE);

  return {
    ...run,
    questions: [...run.questions, ...nextBatch],
  };
}


