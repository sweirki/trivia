// src/arena/ranked/useRankedArenaStore.ts

import { create } from "zustand";
import { RankedMatch, RankedMatchResult, RankedPlayerState } from "./rankedTypes";
import { RANKED_ELO } from "./rankedConstants";
import { createRankedMatch } from "./rankedMatchmaker";
import { calculateNewRating, resolveTier } from "./rankedRating";
import type { NormalizedQuestion as Question } from "@/questions/normalizeQuestions";


type RankedArenaState = {
  // player ranked state
  player: RankedPlayerState;

  // active match
  currentMatch: RankedMatch | null;

  // completed matches (local history)
  history: RankedMatch[];

  // actions
  startMatch: (playerId: string, questionPool: Question[]) => void;
  completeMatch: (
    result: RankedMatchResult,
    playerScore: number,
    opponentScore: number
  ) => void;

  resetMatch: () => void;
};

export const useRankedArenaStore = create<RankedArenaState>((set, get) => ({
  player: {
    rating: RANKED_ELO.BASE_RATING,
    tier: "Bronze",
    wins: 0,
    losses: 0,
    streak: 0,
  },

  currentMatch: null,
  history: [],

  startMatch: (playerId, questionPool) => {
    const { player } = get();

    const match = createRankedMatch(
      playerId,
      player.rating,
      questionPool
    );

    set({ currentMatch: match });
  },

  completeMatch: (result, playerScore, opponentScore) => {
    const { currentMatch, player, history } = get();
    if (!currentMatch) return;

    const opponentRating = player.rating; // AI mirrors rating for now

    const newRating = calculateNewRating(
      player.rating,
      opponentRating,
      result
    );

    const newTier = resolveTier(newRating);

    const updatedPlayer: RankedPlayerState = {
      rating: newRating,
      tier: newTier,
      wins: result === "win" ? player.wins + 1 : player.wins,
      losses: result === "loss" ? player.losses + 1 : player.losses,
      streak:
        result === "win"
          ? Math.max(player.streak, 0) + 1
          : result === "loss"
          ? Math.min(player.streak, 0) - 1
          : 0,
    };

    const completedMatch: RankedMatch = {
      ...currentMatch,
      playerScore,
      opponentScore,
      status: "completed",
      completedAt: Date.now(),
    };

    set({
      player: updatedPlayer,
      currentMatch: null,
      history: [completedMatch, ...history],
    });
  },

  resetMatch: () => {
    set({ currentMatch: null });
  },
}));


