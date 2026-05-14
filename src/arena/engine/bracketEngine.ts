import { Tournament } from "../types/tournament";
import { TournamentBracket } from "../types/bracket";
import { TournamentMatch } from "../types/match";

/**
 * Generate initial tournament bracket.
 * Assumes tournament.players length is valid.
 */
export function generateInitialBracket(
  tournament: Tournament
): TournamentBracket {
  const players = [...tournament.players];

  // Simple pairing: first round qualifiers
  const qualifiers: TournamentMatch[] = [];

  for (let i = 0; i < players.length; i += 2) {
    qualifiers.push({
      id: `q-${i}`,
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
      },
    };
  }

  return {
    qualifiers,
    semifinals: [],
    final: null,
  };
}


 // Advance from qualifiers → semifinals
if (
  qualifiers.length >= 4 &&
  qualifiers.slice(0, 4).every(m => m && m.completed) &&
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


  // Advance from semifinals → final
 // Advance from semifinals → final
if (
  semifinals.length === 2 &&
  semifinals.every(m => m && m.completed) &&
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


