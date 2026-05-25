import { getDailyReward } from "./rewardTable";
import { evaluateDailyClaim } from "./dailyLogic";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useSeasonStore } from "@/seasons/store/useSeasonStore";
import { SEASON_XP } from "@/seasons/seasonXpRules";
import { getDayKeyUTC } from "@/economy/economyRules";

export async function claimDailyReward() {
  const store = usePlayerStore.getState();
  const today = getDayKeyUTC();
  const daily = store.daily;
  const evaluation = evaluateDailyClaim(daily.lastClaimDate, today, daily.streak);

  if (!evaluation.canClaim) {
    return { success: false as const, reason: "ALREADY_CLAIMED" as const };
  }

  const nextStreak = evaluation.nextStreak;
  const reward = getDailyReward(nextStreak);

  const updatedDaily = {
    lastClaimDate: today,
    streak: nextStreak,
    totalClaims: daily.totalClaims + 1,
  };

  store.applyDailyReward(updatedDaily, {
  xp: reward.xp,
  coins: reward.coins,
  gems: reward.gems,
  tickets: reward.tickets,
});

void usePlayerStore.getState().syncNow?.();

  const uid = usePlayerStore.getState().userId;
  if (uid) {
    void useSeasonStore.getState().addSeasonXp(uid, SEASON_XP.DAILY_COMPLETE);
  }

  return {
    success: true as const,
    reward,
    streak: nextStreak,
    isNewStreak: evaluation.isNewStreak,
  };
}



