// src/arena/survival/survivalTypes.ts



export type SurvivalStatus = "active" | "ended";

export type SurvivalRun = {
  runId: string;
questions: any[];

  correctCount: number;
  status: SurvivalStatus;
  startedAt: number;
  endedAt?: number;
};




