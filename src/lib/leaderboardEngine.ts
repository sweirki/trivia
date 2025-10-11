// src/lib/leaderboardEngine.ts
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  where,
  limit,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface LeaderboardEntry {
  uid: string;
  username: string;
  score: number;
  streak: number;
  country?: string;
  updatedAt: Timestamp;
}

/** Add or update global score */
export async function updateGlobalScore(
  uid: string,
  username: string,
  score: number,
  streak: number,
  country?: string
): Promise<void> {
  if (!uid || !username) return;
  if (score > 10000) return; // anti-cheat

  const ref = doc(db, "leaderboards_global", uid);
  await setDoc(
    ref,
    { username, score, streak, country: country ?? "Unknown", updatedAt: Timestamp.now() },
    { merge: true }
  );
}

/** Global top players */
export async function getTopPlayers(limitCount = 50): Promise<LeaderboardEntry[]> {
  const ref = collection(db, "leaderboards_global");
  const q = query(ref, orderBy("score", "desc"), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as LeaderboardEntry) }));
}

/** Regional leaderboard */
export async function getTopPlayersByCountry(
  country: string,
  limitCount = 50
): Promise<LeaderboardEntry[]> {
  const ref = collection(db, "leaderboards_global");
  const q = query(
    ref,
    where("country", "==", country),
    orderBy("score", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as LeaderboardEntry) }));
}

/** Friends-only leaderboard */
export async function getFriendsLeaderboard(
  friendUids: string[],
  limitCount = 50
): Promise<LeaderboardEntry[]> {
  if (!friendUids || friendUids.length === 0) return [];
  const ref = collection(db, "leaderboards_global");
  const chunks = friendUids.length > 10 ? friendUids.slice(0, 10) : friendUids; // Firestore limit
  const q = query(ref, where("__name__", "in", chunks), orderBy("score", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as LeaderboardEntry) }));
}
