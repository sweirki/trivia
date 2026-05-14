// src/arena/ranked/rankedMatchmaker.ts

import { nanoid } from "nanoid/non-secure";
import type { NormalizedQuestion as Question } from "@/questions/normalizeQuestions";
import { RANKED_MATCH_CONFIG, RANKED_AI_DEFAULT } from "./rankedConstants";
import { RankedMatch } from "./rankedTypes";

/**
 * Determine question difficulty from rating
 */
function getDifficultyForRating(rating: number): Question["difficulty"] {
  if (rating < 1000) return "easy";
  if (rating < 1300) return "medium";
  return "hard";
}

/**
 * Select deterministic questions
 * NOTE: assumes caller provides pre-filtered pool
 */
function selectQuestions(
  pool: Question[],
  difficulty: Question["difficulty"],
  count: number
): Question[] {
  return pool
    .filter((q) => q.difficulty === difficulty)
    .slice(0, count);
}

/**
 * Create a ranked match snapshot
 */
export function createRankedMatch(
  playerId: string,
  playerRating: number,
  questionPool: Question[]
): RankedMatch {
  const difficulty = getDifficultyForRating(playerRating);

  const questions = selectQuestions(
    questionPool,
    difficulty,
    RANKED_MATCH_CONFIG.QUESTIONS_PER_MATCH
  );

  return {
    matchId: nanoid(),

    playerId,
    opponentId: "AI_OPPONENT",

    questions,

    playerScore: 0,
    opponentScore: 0,

    status: "pending",

    createdAt: Date.now(),
  };
}


