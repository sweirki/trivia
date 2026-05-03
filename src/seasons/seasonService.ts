import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

import { CURRENT_SEASON, badgeIdForTier } from "./seasonDefinitions";


export type PlayerSeason = {
  seasonId: string;
  xp: number;
  tier: number;
  claimedTiers: number[];
  updatedAt: number;
};

const seasonRef = (uid: string) =>
  doc(db, "players", uid, "season", "current");

const seasonArchiveRef = (uid: string, seasonId: string) =>
  doc(db, "players", uid, "seasonHistory", seasonId);

export async function loadOrCreateSeason(uid: string): Promise<PlayerSeason> {
  const ref = seasonRef(uid);
  const snap = await getDoc(ref);

  // 🆕 No season yet → create fresh
  if (!snap.exists()) {
    const fresh: PlayerSeason = {
      seasonId: CURRENT_SEASON.id,
      xp: 0,
      tier: 0,
      claimedTiers: [],
      updatedAt: Date.now(),
    };
    await setDoc(ref, fresh);
    return fresh;
  }

  const data = snap.data() as PlayerSeason;

  // 🔁 Season rollover (ARCHIVE FIRST)
  if (data.seasonId !== CURRENT_SEASON.id) {
    const archiveRef = seasonArchiveRef(uid, data.seasonId);
    const archived = await getDoc(archiveRef);

    // Write-once archive
   if (!archived.exists()) {
  await setDoc(archiveRef, {
    seasonId: data.seasonId,
    endedAt: new Date().toISOString(),
    finalXp: data.xp ?? 0,
    finalTier: data.tier ?? 0,
    finalBadgeId: badgeIdForTier(data.tier ?? 0),
    claimedTiers: data.claimedTiers ?? [],
  });
}


    const reset: PlayerSeason = {
      seasonId: CURRENT_SEASON.id,
      xp: 0,
      tier: 0,
      claimedTiers: [],
      updatedAt: Date.now(),
    };

    await setDoc(ref, reset);
    return reset;
  }

  return data;
}

export async function updateSeason(
  uid: string,
  patch: Partial<PlayerSeason>
) {
  await updateDoc(seasonRef(uid), {
    ...patch,
    updatedAt: Date.now(),
  });
}

