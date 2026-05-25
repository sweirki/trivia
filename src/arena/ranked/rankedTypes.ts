// src/arena/ranked/rankedTypes.ts

import type { NormalizedQuestion as Question } from "@/questions/normalizeQuestions";


/**
 * Ranked match lifecycle
 */
export type RankedMatchStatus = "pending" | "completed";

/**
 * Player tier bands (UI + logic)
 */
export type RankedTier =
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond";

/**
 * Core ranked match object
 * Deterministic & replay-safe
 */
export type RankedMatch = {
  matchId: string;

  playerId: string;
  opponentId: string;

  questions: Question[];

  playerScore: number;
  opponentScore: number;

  status: RankedMatchStatus;

  createdAt: number;
  completedAt?: number;
};

/**
 * Persistent ranked stats per player
 */
export type RankedPlayerState = {
  rating: number;
  tier: RankedTier;

  wins: number;
  losses: number;

  streak: number; // positive = win streak, negative = loss streak
};

/**
 * Result of a ranked match
 */
export type RankedMatchResult = "win" | "loss" | "draw";




