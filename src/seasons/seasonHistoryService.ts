import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase/firebase";

/**
 * Archived (completed) season snapshot.
 * Read-only by design.
 */
export type ArchivedSeason = {
  seasonId: string;
  endedAt: string; // ISO
  finalXp: number;
  finalTier: number;
  finalBadgeId?: string | null;
  claimedTiers: number[];
};

/**
 * Load archived seasons for a player.
 * - Newest first
 * - Safe if empty
 * - No side effects
 */
export async function listSeasonHistory(
  uid: string
): Promise<ArchivedSeason[]> {
  const ref = collection(db, "players", uid, "seasonHistory");
  const q = query(ref, orderBy("endedAt", "desc"));
  const snap = await getDocs(q);

  if (snap.empty) return [];

  return snap.docs.map(
    (doc) => doc.data() as ArchivedSeason
  );
}

