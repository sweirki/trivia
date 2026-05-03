import { getDailyReward } from "./rewardTable";
import { evaluateDailyClaim } from "./dailyLogic";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useSeasonStore } from "@/seasons/store/useSeasonStore";
import { SEASON_XP } from "@/seasons/seasonXpRules";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

function getTodayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function claimDailyReward() {
 

  const { daily, setDaily, applyReward } =
    usePlayerStore.getState();

  const today = getTodayUTC();

  const evaluation = evaluateDailyClaim(
    daily.lastClaimDate,
    today
  );

  if (!evaluation.canClaim) {
    return {
      success: false,
      reason: "ALREADY_CLAIMED",
    };
  }

  const nextStreak =
    evaluation.isNewStreak
      ? 1
      : daily.streak + 1;

  const reward = getDailyReward(nextStreak);

  // Apply reward (XP / coins)
  applyReward(reward.xp, reward.coins);

// ✅ Season XP for Daily (Phase 6.2)
useSeasonStore
  .getState()
  .addSeasonXp(usePlayerStore.getState().userId, SEASON_XP.DAILY_COMPLETE);

   const updatedDaily = {
    lastClaimDate: today,
    streak: nextStreak,
    totalClaims: daily.totalClaims + 1,
  };

  // 1️⃣ Update local store
  setDaily(updatedDaily);

  // 2️⃣ Persist to Firestore
  const { userId } = usePlayerStore.getState();
  if (userId) {
    await updateDoc(
      doc(db, "players", userId),
      { daily: updatedDaily }
    );
  }

  return {
    success: true,
    reward,
    streak: nextStreak,
    isNewStreak: evaluation.isNewStreak,
  };

}
