import { Tournament } from "../types/tournament";
import { TournamentBracket } from "../types/bracket";
import { TournamentMatch } from "../types/match";

/**
 * Generate the first tournament bracket.
 *
 * The tournament store is responsible for filling to the configured bracket
 * size before this function runs. This engine still guards against invalid odd
 * player counts so the app never crashes on players[i + 1].uid.
 */
export function generateInitialBracket(
  tournament: Tournament
): TournamentBracket {
  const players = [...tournament.players];
  const qualifiers: TournamentMatch[] = [];

  for (let i = 0; i + 1 < players.length; i += 2) {
    qualifiers.push({
      id: `q-${Math.floor(i / 2) + 1}`,
      playerAUid: players[i].uid,
      playerBUid: players[i + 1].uid,
      scoreA: 0,
      scoreB: 0,
      completed: false,
      winnerUid: null,
    });
  }

  return {
    qualifiers,
    semifinals: [],
    final: null,
  };
}

/**
 * Advance bracket based on completed matches.
 *
 * Supported shapes:
 * - 2 players: one qualifier becomes the completed final.
 * - 8 players: four qualifiers -> two semifinals -> one final.
 *
 * The store fills tournaments to 8 players for the full premium flow, so normal
 * gameplay will always use the second path.
 */
export function advanceBracket(
  bracket: TournamentBracket
): TournamentBracket {
  let { qualifiers, semifinals, final } = bracket;

  // ---------------------------------------------------------
  // SMALL TOURNAMENT SUPPORT (2 players / 1 match)
  // If only one qualifier match exists, treat it as the final.
  // ---------------------------------------------------------
  if (qualifiers.length === 1) {
    const only = qualifiers[0];

    if (only && only.completed) {
      return {
        qualifiers,
        semifinals: [],
        final: {
          id: "f-1",
          playerAUid: only.playerAUid,
          playerBUid: only.playerBUid,
          scoreA: only.scoreA,
          scoreB: only.scoreB,
          completed: true,
          winnerUid: only.winnerUid,
          resolvedAt: only.resolvedAt,
          resolutionReason: only.resolutionReason,
        },
      };
    }

    return {
      qualifiers,
      semifinals: [],
      final: null,
    };
  }

  // ---------------------------------------------------------
  // FULL TOURNAMENT SUPPORT (8 players / 4 qualifiers)
  // Qualifier winners create two semifinal matches.
  // ---------------------------------------------------------
  if (
    qualifiers.length >= 4 &&
    qualifiers.slice(0, 4).every((m) => m && m.completed) &&
    semifinals.length === 0
  ) {
    const q0 = qualifiers[0];
    const q1 = qualifiers[1];
    const q2 = qualifiers[2];
    const q3 = qualifiers[3];

    if (!q0?.winnerUid || !q1?.winnerUid || !q2?.winnerUid || !q3?.winnerUid) {
      return bracket;
    }

    semifinals = [
      {
        id: "s-1",
        playerAUid: q0.winnerUid,
        playerBUid: q1.winnerUid,
        scoreA: 0,
        scoreB: 0,
        completed: false,
        winnerUid: null,
      },
      {
        id: "s-2",
        playerAUid: q2.winnerUid,
        playerBUid: q3.winnerUid,
        scoreA: 0,
        scoreB: 0,
        completed: false,
        winnerUid: null,
      },
    ];
  }

  // ---------------------------------------------------------
  // Semifinal winners create the grand final.
  // ---------------------------------------------------------
  if (
    semifinals.length === 2 &&
    semifinals.every((m) => m && m.completed) &&
    !final
  ) {
    const s0 = semifinals[0];
    const s1 = semifinals[1];

    if (!s0?.winnerUid || !s1?.winnerUid) {
      return bracket;
    }

    final = {
      id: "f-1",
      playerAUid: s0.winnerUid,
      playerBUid: s1.winnerUid,
      scoreA: 0,
      scoreB: 0,
      completed: false,
      winnerUid: null,
    };
  }

  return {
    qualifiers,
    semifinals,
    final,
  };
}
