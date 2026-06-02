import { getDailyReward } from "./rewardTable";
import { evaluateDailyClaim } from "./dailyLogic";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useSeasonStore } from "@/seasons/store/useSeasonStore";
import { SEASON_XP } from "@/seasons/seasonXpRules";
import { getDayKeyUTC } from "@/economy/economyRules";
import { useDailyRewardStore } from "@/store/useDailyRewardStore";


const MS_PER_DAY = 86_400_000;

function parseDayKey(day: string) {
  return new Date(`${day}T00:00:00.000Z`);
}

function isPreviousDay(previous: string, today: string) {
  return Math.floor((parseDayKey(today).getTime() - parseDayKey(previous).getTime()) / MS_PER_DAY) === 1;
}

function sameDailyState(a: { lastClaimDate: string | null; streak: number; totalClaims: number }, b: { lastClaimDate: string | null; streak: number; totalClaims: number }) {
  return a.lastClaimDate === b.lastClaimDate && a.streak === b.streak && a.totalClaims === b.totalClaims;
}

export function resolveDailyRewardState() {
  const playerStore = usePlayerStore.getState();
  const playerDaily = playerStore.daily;
  const legacyDaily = useDailyRewardStore.getState();
  const today = getDayKeyUTC();

  let resolvedDaily = playerDaily;

  if (legacyDaily.lastClaimDay) {
    const legacySnapshot = {
      lastClaimDate: legacyDaily.lastClaimDay,
      streak: Math.max(0, Math.floor(legacyDaily.streak || 0)),
      totalClaims: Math.max(playerDaily.totalClaims || 0, Math.max(0, Math.floor(legacyDaily.streak || 0))),
    };

    if (!playerDaily.lastClaimDate) {
      resolvedDaily = legacySnapshot;
    } else if (legacySnapshot.lastClaimDate > playerDaily.lastClaimDate) {
      resolvedDaily = legacySnapshot;
    } else if (
      legacySnapshot.lastClaimDate === playerDaily.lastClaimDate &&
      legacySnapshot.streak > playerDaily.streak
    ) {
      resolvedDaily = { ...playerDaily, streak: legacySnapshot.streak, totalClaims: Math.max(playerDaily.totalClaims, legacySnapshot.totalClaims) };
    } else if (
      playerDaily.lastClaimDate === today &&
      playerDaily.streak <= 1 &&
      isPreviousDay(legacySnapshot.lastClaimDate, today) &&
      legacySnapshot.streak >= 1
    ) {
      resolvedDaily = {
        lastClaimDate: today,
        streak: Math.min(7, legacySnapshot.streak + 1),
        totalClaims: Math.max(playerDaily.totalClaims, legacySnapshot.totalClaims + 1),
      };
    }
  }

  if (!sameDailyState(playerDaily, resolvedDaily)) {
    playerStore.setDaily(resolvedDaily);
  }

  useDailyRewardStore.getState().syncFromPlayerDaily(resolvedDaily);

  return resolvedDaily;
}

export async function claimDailyReward() {
  const store = usePlayerStore.getState();
  const today = getDayKeyUTC();
  const daily = resolveDailyRewardState();
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

  const awardedReward = store.applyDailyReward(updatedDaily, {
  xp: reward.xp,
  coins: reward.coins,
  gems: reward.gems,
  tickets: reward.tickets,
});

useDailyRewardStore.getState().syncFromPlayerDaily(updatedDaily);

void usePlayerStore.getState().syncNow?.();

  const uid = usePlayerStore.getState().userId;
  if (uid) {
    void useSeasonStore.getState().addSeasonXp(uid, SEASON_XP.DAILY_COMPLETE);
  }

  return {
    success: true as const,
    reward: awardedReward,
    baseReward: reward,
    streak: nextStreak,
    isNewStreak: evaluation.isNewStreak,
  };
}



