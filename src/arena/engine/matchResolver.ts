import { TournamentMatch } from "../types/match";

/**
 * Arena-core authoritative match resolver.
 *
 * This is the ONLY place in the app allowed to:
 * - decide a match winner
 * - mark a match as completed
 * - lock match results
 *
 * Rules:
 * - Resolution is single-shot (idempotent)
 * - Completed matches cannot be resolved again
 * - Pure, immutable function
 * - No UI, no bracket advancement, no persistence
 */

export type MatchResolutionReason =
  | "normal"
  | "timeout"
  | "forfeit"
  | "tiebreak";

interface ResolveMatchInput {
  scoreA: number;
  scoreB: number;
  reason?: MatchResolutionReason;
}

export function resolveMatch(
  match: TournamentMatch,
  input: ResolveMatchInput
): TournamentMatch {
  // SAFETY: prevent double resolution
  if (match.completed) {
    return match;
  }

  const { scoreA, scoreB } = input;
  let reason = input.reason ?? "normal";

  // SAFETY: deterministic winner selection
  let winnerUid: string | null = null;

  if (scoreA > scoreB) {
    winnerUid = match.playerAUid;
  } else if (scoreB > scoreA) {
    winnerUid = match.playerBUid;
  } else {
    // TIE-BREAK RULE (deterministic)
    // NOTE: this can be upgraded later (speed, streaks, etc.)
    winnerUid = match.playerAUid;
    reason = "tiebreak";
  }

  return {
    ...match,
    scoreA,
    scoreB,
    winnerUid,
    completed: true,
    resolvedAt: Date.now(),
    resolutionReason: reason,
  };
}




