import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePlayerStore } from "@/store/usePlayerStore";

import { Tournament } from "../types/tournament";
import { TournamentBracket } from "../types/bracket";
import { TournamentMatch } from "../types/match";

import {
  generateInitialBracket,
  advanceBracket,
} from "../engine/bracketEngine";
import { resolveMatch } from "../engine/matchResolver";

/**
 * HARD RULES:
 * - This store is the ONLY tournament authority
 * - UI never decides winners or stages
 * - Matches resolve ONCE
 * - Tournament lifecycle is explicit and locked
 * - Retention logic NEVER mutates tournament logic
 */

export type TournamentLifecycle =
  | "CREATED"
  | "OPEN"
  | "LOCKED"
  | "QUALIFIERS"
  | "SEMIFINALS"
  | "FINAL"
  | "COMPLETED";

interface TournamentStoreState {
  // ----------------------------
  // CORE TOURNAMENT
  // ----------------------------
  tournament: Tournament | null;
  bracket: TournamentBracket | null;
  lifecycle: TournamentLifecycle;

  // ----------------------------
  // RETENTION (PHASE B)
  // ----------------------------
  lastDailyPlayedAt: number | null;
  weeklyPlays: number;
  lastWeeklyResetAt: number | null;
  dailyStreak: number;
  lastStreakAt: number | null;

 // ----------------------------
// CORE ACTIONS
// ----------------------------
createTournament: (t: Tournament) => void;
loadActiveTournament: () => void;
joinTournament: (uid: string, username: string) => boolean;
lockTournament: () => void;
startTournament: () => void;


  // ----------------------------
  // MATCH RESOLUTION
  // ----------------------------
  submitMatchResult: (
    matchId: string,
    scoreA: number,
    scoreB: number
  ) => void;

  // ----------------------------
  // RETENTION ACTION
  // ----------------------------
  markTournamentPlayed: () => void;

  // ----------------------------
  // RESET
  // ----------------------------
  resetTournament: () => void;
}

export const useTournamentStore = create(
  persist<TournamentStoreState>(
    (set, get) => ({
      // ----------------------------
      // INITIAL STATE
      // ----------------------------
      tournament: null,
      bracket: null,
      lifecycle: "CREATED",

      lastDailyPlayedAt: null,
      weeklyPlays: 0,
      lastWeeklyResetAt: null,
      dailyStreak: 0,
      lastStreakAt: null,

      // ----------------------------
      // CREATE
      // ----------------------------
      createTournament: (t) => {
        set({
          tournament: t,
          bracket: null,
          lifecycle: "OPEN",
        });
      },

// ----------------------------
// LOAD ACTIVE TOURNAMENT (BOOTSTRAP)
// ----------------------------
loadActiveTournament: () => {
  const { tournament, lifecycle } = get();

  // If already loaded, do nothing
  if (tournament && lifecycle !== "CREATED") return;

 set({
  tournament: {
    id: "arena-main",
    name: "Arena Tournament",
    createdAt: Date.now(),
    players: [],
    winnerUid: null,
    config: {
      maxPlayers: 8,
      questionsPerMatch: 10,
      timePerQuestion: 10,
      rewardCoins: 100,
      entryFeeCoins: 50,
    },
  } as Tournament,
  bracket: null,
  lifecycle: "OPEN",
});

},


      // ----------------------------
      // JOIN
      // ----------------------------
      joinTournament: (uid, username) => {
        const { tournament, lifecycle } = get();
        if (!tournament) return false;
        if (lifecycle !== "OPEN") return false;

        if (tournament.players.some((p) => p.uid === uid)) return true;
        if (tournament.players.length >= tournament.config.maxPlayers)
          return false;

        set({
          tournament: {
            ...tournament,
            players: [
              ...tournament.players,
              { uid, username, eliminated: false },
            ],
          },
        });

        return true;
      },

      // ----------------------------
      // LOCK
      // ----------------------------
      lockTournament: () => {
        if (get().lifecycle !== "OPEN") return;
        set({ lifecycle: "LOCKED" });
      },

      // ----------------------------
      // START
      // ----------------------------
      startTournament: () => {
        const { tournament, lifecycle } = get();
        if (!tournament) return;
        if (lifecycle !== "LOCKED") return;

        let players = tournament.players;

        if (players.length < 2) {
          players = [
            ...players,
            {
              uid: "bot-1",
              username: "Bot Alpha",
              eliminated: false,
            },
          ];
        }

        const bracket = generateInitialBracket({
          ...tournament,
          players,
        });

        set({
          tournament: {
            ...tournament,
            players,
          },
          bracket,
          lifecycle: "QUALIFIERS",
        });
      },

      // ----------------------------
      // MATCH RESOLUTION (AUTHORITATIVE)
      // ----------------------------
submitMatchResult: (matchId, scoreA, scoreB) => {
  const { bracket, tournament, lifecycle } = get();
  if (!bracket || !tournament) return;

  // Collect all matches
  const allMatches = [
    ...bracket.qualifiers,
    ...bracket.semifinals,
    ...(bracket.final ? [bracket.final] : []),
  ];

  const target = allMatches.find((m) => m.id === matchId);
  if (!target || target.completed) return;

  // 🔒 HARD LOCK — mark match as completed immediately
  const winnerUid =
    scoreA === scoreB
      ? null
      : scoreA > scoreB
      ? target.playerAUid
      : target.playerBUid;

  const resolved = {
    ...target,
    scoreA,
    scoreB,
    winnerUid,
    completed: true,
  };

  const replace = (m: TournamentMatch) =>
    m.id === matchId ? resolved : m;

  let updatedBracket: TournamentBracket = {
    ...bracket,
    qualifiers: bracket.qualifiers.map(replace),
    semifinals: bracket.semifinals.map(replace),
    final:
      bracket.final?.id === matchId
        ? resolved
        : bracket.final,
  };

  updatedBracket = advanceBracket(updatedBracket);

  // ----------------------------
  // LIFECYCLE ADVANCE (ONCE)
  // ----------------------------
  let nextLifecycle = lifecycle;

  if (
    lifecycle === "QUALIFIERS" &&
    updatedBracket.qualifiers.every((m) => m.completed)
  ) {
    nextLifecycle = "SEMIFINALS";
  }

  if (
    lifecycle === "SEMIFINALS" &&
    updatedBracket.semifinals.every((m) => m.completed)
  ) {
    nextLifecycle = "FINAL";
  }

  if (updatedBracket.final?.completed) {
    nextLifecycle = "COMPLETED";
  }

  // ----------------------------
  // COMMIT STATE (ONCE)
  // ----------------------------
  set({
    bracket: updatedBracket,
    lifecycle: nextLifecycle,
    tournament:
      nextLifecycle === "COMPLETED" && winnerUid
        ? { ...tournament, winnerUid }
        : tournament,
  });

  // ----------------------------
  // RETENTION + IDENTITY (FINAL ONLY)
  // ----------------------------
  if (nextLifecycle === "COMPLETED") {
    get().markTournamentPlayed();

    setTimeout(() => {
      const totalPlayers = tournament.players.length;

      if (winnerUid) {
        usePlayerStore.getState().recordTournamentResult({
          position: 1,
          totalPlayers,
        });
      }

      const runnerUpUid =
        winnerUid === target.playerAUid
          ? target.playerBUid
          : target.playerAUid;

      if (runnerUpUid && !runnerUpUid.startsWith("bot")) {
        usePlayerStore.getState().recordTournamentResult({
          position: 2,
          totalPlayers,
        });
      }
    }, 0);

  return;
}


        set({ bracket: updatedBracket });
      },

      // ----------------------------
      // RETENTION — DAILY / WEEKLY / STREAK
      // ----------------------------
      markTournamentPlayed: () => {
        const now = Date.now();
        const today = new Date(now).toDateString();

        const {
          lastDailyPlayedAt,
          lastWeeklyResetAt,
          weeklyPlays,
          dailyStreak,
          lastStreakAt,
        } = get();

        const lastDay = lastDailyPlayedAt
          ? new Date(lastDailyPlayedAt).toDateString()
          : null;

        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;

        const playedToday = lastDay === today;
        const isNewWeek =
          !lastWeeklyResetAt || now - lastWeeklyResetAt > oneWeek;

        let newStreak = dailyStreak;

        if (!playedToday) {
          if (
            lastStreakAt &&
            new Date(lastStreakAt + oneDay).toDateString() === today
          ) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        }

        set({
          lastDailyPlayedAt: playedToday ? lastDailyPlayedAt : now,
          weeklyPlays: isNewWeek
            ? 1
            : weeklyPlays + (playedToday ? 0 : 1),
          lastWeeklyResetAt: isNewWeek ? now : lastWeeklyResetAt,
          dailyStreak: newStreak,
          lastStreakAt: now,
        });
      },

      // ----------------------------
      // RESET
      // ----------------------------
      resetTournament: () => {
        set({
          tournament: null,
          bracket: null,
          lifecycle: "CREATED",
        });
      },
    }),
    {
      name: "arena-tournament-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);


