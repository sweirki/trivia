import { create } from "zustand";
import { TournamentHistoryRecord } from "./tournamentHistoryTypes";

export const useTournamentHistoryStore = create<{
  history: TournamentHistoryRecord[];
  log: (r: TournamentHistoryRecord) => void;
}>(set => ({
  history: [],
  log: r => set(s => ({ history: [...s.history, r] })),
}));
