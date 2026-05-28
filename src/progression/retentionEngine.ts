export type RetentionPlanInput = {
  level?: number;
  xp?: number;
  xpRequired?: number;
  dailyStreak?: number;
  totalGamesPlayed?: number;
  accuracy?: number;
  earnedXP?: number;
  earnedCoins?: number;
};

export type RetentionPlan = {
  title: string;
  message: string;
  nextGoal: string;
  progressLabel: string;
  progressPercent: number;
  rewardTease: string;
};

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function getRetentionPlan(input: RetentionPlanInput): RetentionPlan {
  const level = Math.max(1, input.level ?? 1);
  const xp = Math.max(0, input.xp ?? 0);
  const xpRequired = Math.max(1, input.xpRequired ?? level * 150 + level * level * 6);
  const dailyStreak = Math.max(0, input.dailyStreak ?? 0);
  const totalGamesPlayed = Math.max(0, input.totalGamesPlayed ?? 0);
  const accuracy = clampPercent(input.accuracy ?? 0);

  const xpPercent = clampPercent((xp / xpRequired) * 100);
  const xpRemaining = Math.max(0, xpRequired - xp);
  const nextStreakMilestone = dailyStreak < 3 ? 3 : dailyStreak < 7 ? 7 : dailyStreak < 14 ? 14 : 30;
  const streakRemaining = Math.max(0, nextStreakMilestone - dailyStreak);

  if (totalGamesPlayed <= 1) {
    return {
      title: "First run locked in",
      message: "Your profile has started building momentum. Play one more match to turn this into a real streak.",
      nextGoal: "Play 2 total matches",
      progressLabel: `${Math.min(totalGamesPlayed, 2)} / 2 matches`,
      progressPercent: clampPercent((totalGamesPlayed / 2) * 100),
      rewardTease: "Next: starter XP burst",
    };
  }

  if (dailyStreak === 0) {
    return {
      title: "Daily streak waiting",
      message: "Claim today’s daily reward to activate your comeback chain before the next match.",
      nextGoal: "Claim today’s daily reward",
      progressLabel: "0 / 1 claim",
      progressPercent: 8,
      rewardTease: "Next: coins, XP, and streak growth",
    };
  }

  if (streakRemaining > 0) {
    return {
      title: `${dailyStreak}-day streak active`,
      message: `Keep showing up. You are ${streakRemaining} day${streakRemaining === 1 ? "" : "s"} from the next streak milestone.`,
      nextGoal: `Reach day ${nextStreakMilestone}`,
      progressLabel: `${dailyStreak} / ${nextStreakMilestone} days`,
      progressPercent: clampPercent((dailyStreak / nextStreakMilestone) * 100),
      rewardTease: nextStreakMilestone >= 7 ? "Next: premium reward tier tease" : "Next: stronger daily chest",
    };
  }

  if (accuracy >= 80) {
    return {
      title: "Hot hand detected",
      message: "You are playing above elite accuracy pace. Push another match while the streak energy is high.",
      nextGoal: "Hold 80%+ accuracy",
      progressLabel: `${accuracy}% accuracy`,
      progressPercent: accuracy,
      rewardTease: "Next: mastery badge progress",
    };
  }

  return {
    title: "Next level is close",
    message: xpRemaining <= 0 ? "Level-up ready. Play again to bank the momentum." : `${xpRemaining} XP until your next level milestone.`,
    nextGoal: `Reach Level ${level + 1}`,
    progressLabel: `${xp} / ${xpRequired} XP`,
    progressPercent: xpPercent,
    rewardTease: "Next: profile prestige progress",
  };
}

export function getDailyRetentionCopy(streak: number, alreadyClaimedToday: boolean) {
  if (alreadyClaimedToday) {
    return {
      title: "Tomorrow is loaded",
      message: `Your ${streak}-day streak is protected. Come back tomorrow to keep the reward ladder alive.`,
    };
  }

  if (streak <= 0) {
    return {
      title: "Start the chain",
      message: "Claim today to activate your first comeback reason before playing another match.",
    };
  }

  return {
    title: "Protect the chain",
    message: `Your ${streak}-day streak is waiting. Claim now so today's progress does not go cold.`,
  };
}


