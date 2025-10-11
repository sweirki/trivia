// src/live/liveEngine.ts
import { ref, push, set, update, get, onValue } from "firebase/database";
import { rtdb } from "../../src/lib/firebase";

export type Player = { uid: string; name: string; score: number; ready: boolean };
export type Match = {
  id: string;
  mode: "duel" | "tournament" | "daily" | "survival";
  players: Record<string, Player>;
  status: "waiting" | "active" | "finished";
  questionIndex: number;
};

export async function createMatch(mode: Match["mode"], user: Player) {
  const matchRef = push(ref(rtdb, `matches/${mode}`));
  const match: Match = {
    id: matchRef.key!,
    mode,
    players: { [user.uid]: user },
    status: "waiting",
    questionIndex: 0,
  };
  await set(matchRef, match);
  return match;
}

export async function joinMatch(mode: Match["mode"], user: Player) {
  const matchesRef = ref(rtdb, `matches/${mode}`);
  let joined: Match | null = null;

  onValue(matchesRef, (snap) => {
    const data = snap.val();
    if (!data) return;
    const open = Object.values<Match>(data).find(
      (m) => m.status === "waiting" && Object.keys(m.players).length < 2
    );
    if (open && !joined) {
      const updates: any = {};
      updates[`matches/${mode}/${open.id}/players/${user.uid}`] = user;
      updates[`matches/${mode}/${open.id}/status`] = "active";
      update(ref(rtdb), updates);
      joined = { ...open, players: { ...open.players, [user.uid]: user }, status: "active" };
    }
  });

  return joined;
}

export async function updateScore(mode: string, matchId: string, uid: string, delta: number) {
  const scoreRef = ref(rtdb, `matches/${mode}/${matchId}/players/${uid}/score`);
  onValue(scoreRef, (snap) => {
    const current = snap.val() || 0;
    update(ref(rtdb), {
      [`matches/${mode}/${matchId}/players/${uid}/score`]: current + delta,
    });
  });
}

export async function endMatch(mode: string, matchId: string) {
  await update(ref(rtdb), { [`matches/${mode}/${matchId}/status`]: "finished" });
}