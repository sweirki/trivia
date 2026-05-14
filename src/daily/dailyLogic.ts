import { getDayKeyUTC } from "@/economy/economyRules";

type DailyEvaluationResult = {
  canClaim: boolean;
  nextStreak: number;
  isNewStreak: boolean;
  alreadyClaimedToday: boolean;
  daysSinceLastClaim: number | null;
};

const MS_PER_DAY = 86_400_000;

function parseDayKey(day: string) {
  return new Date(`${day}T00:00:00.000Z`);
}

export function getNextDailyStreak(currentStreak: number, isNewStreak: boolean) {
  if (isNewStreak) return 1;

  const next = Math.floor(currentStreak || 0) + 1;
  return next > 7 ? 1 : next;
}

export function evaluateDailyClaim(
  lastClaimDay: string | null,
  todayDay: string = getDayKeyUTC(),
  currentStreak = 0
): DailyEvaluationResult {
  if (!lastClaimDay) {
    return {
      canClaim: true,
      nextStreak: 1,
      isNewStreak: true,
      alreadyClaimedToday: false,
      daysSinceLastClaim: null,
    };
  }

  if (lastClaimDay === todayDay) {
    return {
      canClaim: false,
      nextStreak: Math.max(1, Math.floor(currentStreak || 1)),
      isNewStreak: false,
      alreadyClaimedToday: true,
      daysSinceLastClaim: 0,
    };
  }

  const last = parseDayKey(lastClaimDay);
  const today = parseDayKey(todayDay);
  const diffDays = Math.floor((today.getTime() - last.getTime()) / MS_PER_DAY);

  if (diffDays === 1) {
    return {
      canClaim: true,
      nextStreak: getNextDailyStreak(currentStreak, false),
      isNewStreak: false,
      alreadyClaimedToday: false,
      daysSinceLastClaim: diffDays,
    };
  }

  return {
    canClaim: true,
    nextStreak: 1,
    isNewStreak: true,
    alreadyClaimedToday: false,
    daysSinceLastClaim: diffDays,
  };
}
