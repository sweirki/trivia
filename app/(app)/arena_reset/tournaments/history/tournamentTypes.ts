import { create } from "zustand";

export interface TournamentHistoryRecord {
  id: string;
  winnerUid: string;
  completedAt: number;
}


