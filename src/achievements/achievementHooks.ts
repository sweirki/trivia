import {
  unlockAchievement,
  updateAchievementProgress,
} from "./achievementService";

type GameResult = {
  userId: string | null;
  won: boolean;
  correctCount: number;
  totalQuestions: number;
  durationMs: number;
  totalGamesPlayed: number;
  totalWins: number;
  winStreak: number;
};

export async function onGameFinished(result: GameResult) {
  console.log("🔥 onGameFinished CALLED", result);

  const { userId } = result;

  if (!userId) {
    console.warn("[C1] onGameFinished called without userId", result);
    return;
  }

  console.log("[C1] onGameFinished EXECUTED for uid:", userId);

  // ----------------------------
  // FIRST-TIME ACHIEVEMENTS
  // ----------------------------

  if (result.totalGamesPlayed >= 1) {
    await unlockAchievement(userId, "G1_01_FIRST_GAME");
  }

  if (result.totalWins >= 1) {
    await unlockAchievement(userId, "G1_02_FIRST_WIN");
  }

  if (!result.won && result.totalGamesPlayed >= 1) {
    await unlockAchievement(userId, "G1_03_FIRST_LOSS");
  }

  // ----------------------------
  // VOLUME (AUTO-UNLOCK VIA PROGRESS)
  // ----------------------------

  await updateAchievementProgress(
    userId,
    "G2_01_10_GAMES",
    result.totalGamesPlayed,
    10
  );
  await updateAchievementProgress(
    userId,
    "G2_02_50_GAMES",
    result.totalGamesPlayed,
    50
  );
  await updateAchievementProgress(
    userId,
    "G2_03_100_GAMES",
    result.totalGamesPlayed,
    100
  );

  await updateAchievementProgress(
    userId,
    "G2_04_10_WINS",
    result.totalWins,
    10
  );
  await updateAchievementProgress(
    userId,
    "G2_05_50_WINS",
    result.totalWins,
    50
  );
  await updateAchievementProgress(
    userId,
    "G2_06_100_WINS",
    result.totalWins,
    100
  );

  // ----------------------------
  // SKILL ACHIEVEMENTS
  // ----------------------------

  if (
    result.won &&
    result.correctCount === result.totalQuestions &&
    result.totalQuestions > 0
  ) {
    await unlockAchievement(userId, "G3_01_FLAWLESS_WIN");
  }

  if (result.won && result.durationMs > 0 && result.durationMs < 60_000) {
    await unlockAchievement(userId, "G3_02_SPEED_RUNNER");
  }

  await updateAchievementProgress(
    userId,
    "G3_03_WIN_STREAK_3",
    result.winStreak,
    3
  );
  await updateAchievementProgress(
    userId,
    "G3_04_WIN_STREAK_5",
    result.winStreak,
    5
  );
}

