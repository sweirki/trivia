// src/lib/achievementsEngine.ts
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  color: string;
  unlockedAt: Timestamp;
}

export interface PlayerAchievements {
  badges: Achievement[];
}

const BADGE_RULES = [
  { id: "first_win",   name: "First Win",    icon: "🥇", color: "#FFD700" },
  { id: "streak_5",    name: "Streak 5",     icon: "🔥", color: "#FF6B00" },
  { id: "streak_10",   name: "Streak 10",    icon: "⚡", color: "#00BFFF" },
  { id: "score_1000",  name: "Score 1 K",    icon: "💎", color: "#8A2BE2" },
  { id: "score_5000",  name: "Score 5 K",    icon: "👑", color: "#00FF7F" },
];

/** Compute which badges a player should have */
export function calculateAchievements(score: number, streak: number): string[] {
  const ids: string[] = [];
  if (score >= 1000) ids.push("score_1000");
  if (score >= 5000) ids.push("score_5000");
  if (streak >= 5) ids.push("streak_5");
  if (streak >= 10) ids.push("streak_10");
  ids.push("first_win");
  return ids;
}

/** Update / merge achievements in Firestore */
export async function updatePlayerAchievements(uid: string, score: number, streak: number) {
  if (!uid) return;
  const ids = calculateAchievements(score, streak);
  const ref = doc(db, "achievements", uid);
  const existing = await getDoc(ref);
  const oldData = (existing.exists() ? (existing.data() as PlayerAchievements) : { badges: [] });
  const now = Timestamp.now();

  const merged = [
    ...oldData.badges,
    ...BADGE_RULES.filter(
      (b) => ids.includes(b.id) && !oldData.badges.some((x) => x.id === b.id)
    ).map((b) => ({ ...b, unlockedAt: now })),
  ];

  await setDoc(ref, { badges: merged }, { merge: true });
}

/** Read badges for UI */
export async function getPlayerAchievements(uid: string): Promise<Achievement[]> {
  const ref = doc(db, "achievements", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as PlayerAchievements).badges : [];
}
