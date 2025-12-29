// tournamentStore.ts
// ★ PHASE 11.5 — SINGLE ACTIVE TOURNAMENT (A++++ CANONICAL) ★

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";


type TournamentStoreState = {
  activeTournament: any;
  createTournament: (args: any) => void;
  joinTournament: (playerId: string) => boolean;
  startTournament: () => void;
  resolveMatch: (matchId: string, winnerId: string) => void;
  resetTournament: () => void;
};

// --------------------------------------------------
// TYPES
// --------------------------------------------------
type MatchNode = {
  id: string;
  round: 1 | 2 | 3;
  playerA?: string;
  playerB?: string;
  winner?: string;
  resolved: boolean;
};

type ActiveTournament = {
  id: string;
  title: string;
  entryFee: number;
  prizePool: number;
  players: string[];
  bracket: MatchNode[];
  status: "lobby" | "active" | "completed";
  startTime: number | null;
  champion?: string;
};

// --------------------------------------------------
// HELPERS (PURE)
// --------------------------------------------------
const generateBracket = (players: string[]): MatchNode[] => {
  if (players.length !== 8) {
    throw new Error("Tournament requires exactly 8 players");
  }

  const [p0, p1, p2, p3, p4, p5, p6, p7] = players;

  return [
    // Round 1 — Quarterfinals
    { id: "Q1", round: 1, playerA: p0, playerB: p7, resolved: false },
    { id: "Q2", round: 1, playerA: p1, playerB: p6, resolved: false },
    { id: "Q3", round: 1, playerA: p2, playerB: p5, resolved: false },
    { id: "Q4", round: 1, playerA: p3, playerB: p4, resolved: false },

    // Round 2 — Semifinals
    { id: "S1", round: 2, resolved: false },
    { id: "S2", round: 2, resolved: false },

    // Round 3 — Final
    { id: "F1", round: 3, resolved: false },
  ];
};

const advanceMap: Record<
  string,
  { nextId: string; slot: "playerA" | "playerB" } | null
> = {
  Q1: { nextId: "S1", slot: "playerA" },
  Q2: { nextId: "S1", slot: "playerB" },
  Q3: { nextId: "S2", slot: "playerA" },
  Q4: { nextId: "S2", slot: "playerB" },
  S1: { nextId: "F1", slot: "playerA" },
  S2: { nextId: "F1", slot: "playerB" },
  F1: null,
};

// --------------------------------------------------
// STORE
// --------------------------------------------------

 export const useTournamentStore = create(
  persist<TournamentStoreState>(

    (set, get) => ({
      // ----------------------------------------------
      // STATE
      // ----------------------------------------------
      activeTournament: null as ActiveTournament | null,

      // ----------------------------------------------
      // CREATE TOURNAMENT (ADMIN / SYSTEM)
      // ----------------------------------------------
      createTournament: ({
        id,
        title,
        entryFee,
        prizePool,
        startTime,
      }: {
        id: string;
        title: string;
        entryFee: number;
        prizePool: number;
        startTime: number;
      }) => {
        set({
          activeTournament: {
            id,
            title,
            entryFee,
            prizePool,
            players: [],
            bracket: [],
            status: "lobby",
            startTime,
          },
        });
      },

      // ----------------------------------------------
      // JOIN TOURNAMENT
      // ----------------------------------------------
      joinTournament: (playerId: string) => {
        const t = get().activeTournament;
        if (!t) return false;
        if (t.status !== "lobby") return false;
        if (t.players.includes(playerId)) return true;
        if (t.players.length >= 8) return false;

        set({
          activeTournament: {
            ...t,
            players: [...t.players, playerId],
          },
        });

        return true;
      },

      // ----------------------------------------------
      // START TOURNAMENT (LOCK BRACKET)
      // ----------------------------------------------
      startTournament: () => {
        const t = get().activeTournament;
        if (!t) return;
        if (t.players.length !== 8) return;

        set({
          activeTournament: {
            ...t,
            status: "active",
            bracket: generateBracket(t.players),
          },
        });
      },

      // ----------------------------------------------
      // RESOLVE MATCH
      // ----------------------------------------------
      resolveMatch: (matchId: string, winnerId: string) => {
        const t = get().activeTournament;
        if (!t || t.status !== "active") return;

        const bracket = [...t.bracket];
        const match = bracket.find((m) => m.id === matchId);
        if (!match) return;
        if (match.resolved) return;
        if (
          match.playerA !== winnerId &&
          match.playerB !== winnerId
        )
          return;

        match.winner = winnerId;
        match.resolved = true;

        const advance = advanceMap[matchId];
        if (advance) {
          const next = bracket.find((m) => m.id === advance.nextId);
          if (next && !next[advance.slot]) {
            next[advance.slot] = winnerId;
          }
        }

        let updated: ActiveTournament = {
          ...t,
          bracket,
        };

        if (matchId === "F1") {
          updated = {
            ...updated,
            status: "completed",
            champion: winnerId,
          };
        }

        set({ activeTournament: updated });
      },

      // ----------------------------------------------
      // RESET (ADMIN / DEV)
      // ----------------------------------------------
      resetTournament: () => {
        set({ activeTournament: null });
      },
    }),
    {
      name: "tournament-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activeTournament: state.activeTournament,
      }),
    }
  )
);
