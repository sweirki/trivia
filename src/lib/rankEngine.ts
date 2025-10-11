// src/lib/rankEngine.ts
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

/** Data structure for player rank and XP */
export interface RankData {
  xp: number;
  rank: string;
  updatedAt: Timestamp;
}

/** XP formula: adds base XP from score + streak bonus */
export function calculateXP(score: number, streak: number): number {
  const baseXP = score * 0.5 + streak * 10;
  return Math.floor(baseXP);
}

/** Rank thresholds */
export function determineRank(xp: number): string {
  if (xp < 1000) return "Bronze";
  if (xp < 3000) return "Silver";
  if (xp < 7000) return "Gold";
  if (xp < 15000) return "Platinum";
  if (xp < 30000) return "Diamond";
  if (xp < 60000) return "Master";
  return "Legend";
}

/** Color mapping for rank display */
export function rankColor(rank: string): string {
  switch (rank) {
    case "Bronze": return "#CD7F32";
    case "Silver": return "#C0C0C0";
    case "Gold": return "#FFD700";
    case "Platinum": return "#00FFFF";
    case "Diamond": return "#00BFFF";
    case "Master": return "#9932CC";
    case "Legend": return "#FF4500";
    default: return "#FFFFFF";
  }
}

/** Update or create player's XP & Rank */
export async function updatePlayerRank(
  uid: string,
  score: number,
  streak: number
): Promise<void> {
  if (!uid) return;
  const ref = doc(db, "ranks", uid);
  const snap = await getDoc(ref);
  const prevXP = snap.exists() ? (snap.data().xp as number) : 0;

  const newXP = prevXP + calculateXP(score, streak);
  const rank = determineRank(newXP);

  await setDoc(ref, { xp: newXP, rank, updatedAt: Timestamp.now() }, { merge: true });
}

/** Fetch rank data for display */
export async function getPlayerRankData(uid: string): Promise<RankData | null> {
  const ref = doc(db, "ranks", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as RankData) : null;
}
