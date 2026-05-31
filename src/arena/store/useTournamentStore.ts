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
 *
 * PREMIUM SOLO TOURNAMENT RULE:
 * - Starting a tournament fills the bracket to 8 players with bots.
 * - Bot-vs-bot matches auto-resolve.
 * - The player experiences a full qualifier -> semifinal -> final path.
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

const RIVAL_NAMES = [
  "Astra",
  "Kairo",
  "Orion",
  "Mira",
  "Vega",
  "Riven",
  "Nyx",
  "Drake",
  "Luna",
  "Kai",
  "Nova",
  "Soren",
  "Aria",
  "Blaze",
  "Vera",
  "Cruz",
];

function isBotUid(uid?: string | null) {
  return Boolean(uid?.startsWith("bot-"));
}

function getRivalName(index: number) {
  return RIVAL_NAMES[index % RIVAL_NAMES.length];
}

function fillTournamentPlayers(tournament: Tournament) {
  const maxPlayers = Math.max(2, tournament.config.maxPlayers || 8);
  const players = [...tournament.players];
  const existingUids = new Set(players.map((p) => p.uid));
  let botIndex = 1;

  while (players.length < maxPlayers) {
    const uid = `bot-${botIndex}`;

    if (!existingUids.has(uid)) {
      existingUids.add(uid);
      players.push({
        uid,
        username: getRivalName(botIndex - 1),
        eliminated: false,
      });
    }

    botIndex += 1;
  }

  return players.slice(0, maxPlayers);
}

function getBotScoreSeed(match: TournamentMatch) {
  return match.id
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function getBotScorePair(match: TournamentMatch) {
  const seed = getBotScoreSeed(match);
  const scoreA = 5 + (seed % 5);
  let scoreB = 5 + ((seed + 2) % 5);

  // Avoid too many ties in simulated bot matches while keeping outcomes stable.
  if (scoreA === scoreB) {
    scoreB = Math.max(0, scoreB - 1);
  }

  return { scoreA, scoreB };
}

function resolveBotOnlyMatch(match: TournamentMatch) {
  const { scoreA, scoreB } = getBotScorePair(match);
  return resolveMatch(match, {
    scoreA,
    scoreB,
    reason: "normal",
  });
}

function autoResolveBotOnlyMatches(bracket: TournamentBracket) {
  let updated = advanceBracket(bracket);
  let changed = true;

  while (changed) {
    changed = false;

    const replaceIfBotOnly = (match: TournamentMatch) => {
      if (
        match.completed ||
        !isBotUid(match.playerAUid) ||
        !isBotUid(match.playerBUid)
      ) {
        return match;
      }

      changed = true;
      return resolveBotOnlyMatch(match);
    };

    updated = {
      ...updated,
      qualifiers: updated.qualifiers.map(replaceIfBotOnly),
      semifinals: updated.semifinals.map(replaceIfBotOnly),
      final: updated.final ? replaceIfBotOnly(updated.final) : null,
    };

    if (changed) {
      updated = advanceBracket(updated);
    }
  }

  return updated;
}

function getLifecycleFromBracket(
  bracket: TournamentBracket,
  fallback: TournamentLifecycle
): TournamentLifecycle {
  if (bracket.final?.completed) return "COMPLETED";
  if (bracket.final) return "FINAL";
  if (bracket.semifinals.length > 0) return "SEMIFINALS";
  if (bracket.qualifiers.length > 0) return "QUALIFIERS";
  return fallback;
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

        // If already loaded, do nothing.
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
        if (tournament.players.length >= tournament.config.maxPlayers) {
          return false;
        }

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

        const players = fillTournamentPlayers(tournament);
        const bracket = autoResolveBotOnlyMatches(
          generateInitialBracket({
            ...tournament,
            players,
          })
        );

        set({
          tournament: {
            ...tournament,
            players,
          },
          bracket,
          lifecycle: getLifecycleFromBracket(bracket, "QUALIFIERS"),
        });
      },

      // ----------------------------
      // MATCH RESOLUTION (AUTHORITATIVE)
      // ----------------------------
      submitMatchResult: (matchId, scoreA, scoreB) => {
        const { bracket, tournament, lifecycle } = get();
        if (!bracket || !tournament) return;

        // Collect all matches.
        const allMatches = [
          ...bracket.qualifiers,
          ...bracket.semifinals,
          ...(bracket.final ? [bracket.final] : []),
        ];

        const target = allMatches.find((m) => m.id === matchId);
        if (!target || target.completed) return;

        // HARD LOCK: resolve through the authoritative tournament resolver.
        // Tied matches use the official deterministic tiebreak rule instead of
        // leaving the bracket with a null winner.
        const resolved = resolveMatch(target, { scoreA, scoreB });
        const winnerUid = resolved.winnerUid;

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

        // Advance after the human match, then auto-resolve any bot-only matches
        // that become available. This is what unlocks semifinals/finals during
        // solo testing instead of leaving the bracket stuck.
        updatedBracket = autoResolveBotOnlyMatches(updatedBracket);

        const nextLifecycle = getLifecycleFromBracket(updatedBracket, lifecycle);
        const championUid = updatedBracket.final?.winnerUid ?? null;

        // ----------------------------
        // COMMIT STATE (ONCE)
        // ----------------------------
        set({
          bracket: updatedBracket,
          lifecycle: nextLifecycle,
          tournament:
            nextLifecycle === "COMPLETED" && championUid
              ? { ...tournament, winnerUid: championUid }
              : tournament,
        });

        // ----------------------------
        // RETENTION + IDENTITY (FINAL ONLY)
        // ----------------------------
        if (nextLifecycle === "COMPLETED") {
          get().markTournamentPlayed();

          setTimeout(() => {
            const totalPlayers = tournament.players.length;
            const final = updatedBracket.final;

            if (!final) return;

            if (championUid && !isBotUid(championUid)) {
              usePlayerStore.getState().recordTournamentResult({
                position: 1,
                totalPlayers,
              });
            }

            const runnerUpUid =
              championUid === final.playerAUid
                ? final.playerBUid
                : final.playerAUid;

            if (runnerUpUid && !isBotUid(runnerUpUid)) {
              usePlayerStore.getState().recordTournamentResult({
                position: 2,
                totalPlayers,
              });
            }
          }, 0);
        }
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
