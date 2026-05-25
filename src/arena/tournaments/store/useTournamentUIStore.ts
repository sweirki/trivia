// app/(app)/arena/tournaments/store/useTournamentUIStore.ts

import { create } from "zustand";

interface TournamentUIState {
  isCreating: boolean;
  isInLobby: boolean;
  isInMatch: boolean;

  setCreating: (v: boolean) => void;
  setLobby: (v: boolean) => void;
  setInMatch: (v: boolean) => void;
  resetUI: () => void;
}

export const useTournamentUIStore = create<TournamentUIState>(
  (set) => ({
    isCreating: false,
    isInLobby: false,
    isInMatch: false,

    setCreating: (v) => set({ isCreating: v }),
    setLobby: (v) => set({ isInLobby: v }),
    setInMatch: (v) => set({ isInMatch: v }),

    resetUI: () =>
      set({
        isCreating: false,
        isInLobby: false,
        isInMatch: false,
      }),
  })
);




