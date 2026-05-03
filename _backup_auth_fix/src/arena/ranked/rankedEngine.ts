// src/arena/ranked/rankedEngine.ts

import { useRankedArenaStore } from "./useRankedArenaStore";
import { RankedMatchResult } from "./rankedTypes";

/**
 * Start a ranked match using existing Quick Play flow
 */
export function startRankedGame(
  playerId: string,
  questionPool: any[]
) {
  const { startMatch } = useRankedArenaStore.getState();

  startMatch(playerId, questionPool);
}

/**
 * Complete a ranked match and resolve outcome
 */
export function finishRankedGame(
  playerScore: number,
  opponentScore: number
) {
  const { completeMatch } = useRankedArenaStore.getState();

  let result: RankedMatchResult = "draw";

  if (playerScore > opponentScore) result = "win";
  else if (playerScore < opponentScore) result = "loss";

  completeMatch(result, playerScore, opponentScore);
}
