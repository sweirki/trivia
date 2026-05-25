import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

import { loadOrCreateSeason, updateSeason } from "./seasonService";
import { CURRENT_SEASON, badgeIdForTier } from "./seasonDefinitions";

/**
 * One-time season reset.
 * Archives the outgoing season BEFORE resetting.
 * Safe to call multiple times (idempotent).
 */
export async function resetSeasonForUser(uid: string) {
  // 1) Load current season snapshot
  const currentSeason = await loadOrCreateSeason(uid);

  // 2) Archive ONLY if rolling from an older season to CURRENT_SEASON
  if (currentSeason.seasonId && currentSeason.seasonId !== CURRENT_SEASON.id) {
    const archiveRef = doc(db, "players", uid, "seasonHistory", currentSeason.seasonId);
    const existing = await getDoc(archiveRef);

    if (!existing.exists()) {
      const finalTier = currentSeason.tier ?? 0;
      await setDoc(archiveRef, {
        seasonId: currentSeason.seasonId,
        endedAt: new Date().toISOString(),
        finalXp: currentSeason.xp ?? 0,
        finalTier,
        finalBadgeId: badgeIdForTier(finalTier),
        claimedTiers: currentSeason.claimedTiers ?? [],
      });
    }
  }

  // 3) Reset to fresh current season (unchanged behavior)
  await updateSeason(uid, {
    seasonId: CURRENT_SEASON.id,
    xp: 0,
    tier: 0,
    claimedTiers: [],
  });
}




