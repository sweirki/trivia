// app/(app)/arena/tournaments/store/useTournamentPlayerStore.ts

import { create } from "zustand";

interface TournamentPlayerState {
  playerUid: string | null;
  totalScore: number;

  setPlayer: (uid: string) => void;
  addScore: (amount: number) => void;
  resetPlayer: () => void;
}

export const useTournamentPlayerStore = create<TournamentPlayerState>(
  (set) => ({
    playerUid: null,
    totalScore: 0,

    setPlayer: (uid) => set({ playerUid: uid }),
    addScore: (amount) =>
      set((state) => ({ totalScore: state.totalScore + amount })),
    resetPlayer: () => set({ playerUid: null, totalScore: 0 }),
  })
);


