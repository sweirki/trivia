// src/daily/dailyLogic.ts

type DailyEvaluationResult = {
  canClaim: boolean;
  nextStreak: number;
  isNewStreak: boolean;
};

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function evaluateDailyClaim(
  lastClaimDay: string | null,
  todayDay: string
): DailyEvaluationResult {
  // First ever claim
  if (!lastClaimDay) {
    return {
      canClaim: true,
      nextStreak: 1,
      isNewStreak: true,
    };
  }

  // Already claimed today
  if (lastClaimDay === todayDay) {
    return {
      canClaim: false,
      nextStreak: 0,
      isNewStreak: false,
    };
  }

  const last = new Date(lastClaimDay);
  const today = new Date(todayDay);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const yesterdayKey = dayKey(yesterday);

  // Consecutive day → continue streak
  if (lastClaimDay === yesterdayKey) {
    return {
      canClaim: true,
      nextStreak: 0, // caller increments
      isNewStreak: false,
    };
  }

  // Missed a day → reset streak
  return {
    canClaim: true,
    nextStreak: 1,
    isNewStreak: true,
  };
}
