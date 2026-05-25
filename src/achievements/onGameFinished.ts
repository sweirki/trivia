// src/achievements/onGameFinished.ts

import {
  unlockAchievement,
  updateAchievementProgress,
} from "@/achievements/achievementService";

import { useSeasonStore } from "@/seasons/store/useSeasonStore"
import { SEASON_XP } from "@/seasons/seasonXpRules"

export type GameResult = {
  userId: string | null
  won: boolean
  correctCount: number
  totalQuestions: number

  durationMs: number
  totalGamesPlayed: number
  totalWins: number
  winStreak: number
}

export async function onGameFinished(result: GameResult) {
  const { userId } = result
  if (!userId) return

  // =========================
  // FIRST-TIME ACHIEVEMENTS
  // =========================

  // First game ever
  await unlockAchievement(userId, "G1_01_FIRST_GAME")

  // First win
  if (result.won) {
    await unlockAchievement(userId, "G1_02_FIRST_WIN")
  }

  // First perfect game
  if (result.correctCount === result.totalQuestions) {
    await unlockAchievement(userId, "G1_03_FIRST_PERFECT")
  }

  // =========================
  // GAMES PLAYED (PROGRESSION)
  // =========================

  await updateAchievementProgress(
  userId,
  "G2_01_10_GAMES",
  result.totalGamesPlayed,
  10
)


  await updateAchievementProgress(
  userId,
  "G2_02_50_GAMES",
  result.totalGamesPlayed,
  50
)


 await updateAchievementProgress(
  userId,
  "G2_03_100_GAMES",
  result.totalGamesPlayed,
  100
)


  // =========================
  // TOTAL WINS (PROGRESSION)
  // =========================

  await updateAchievementProgress(
  userId,
  "G3_01_5_WINS",
  result.totalWins,
  5
)


  await updateAchievementProgress(
  userId,
  "G3_02_25_WINS",
  result.totalWins,
  25
)


 await updateAchievementProgress(
  userId,
  "G3_03_100_WINS",
  result.totalWins,
  100
)


  // =========================
  // WIN STREAKS
  // =========================

  await updateAchievementProgress(
  userId,
  "G4_01_3_WIN_STREAK",
  result.winStreak,
  3
)


 await updateAchievementProgress(
  userId,
  "G4_02_7_WIN_STREAK",
  result.winStreak,
  7
)

  // =========================
  // SPEED / SKILL
  // =========================

  // Fast win (example: under 30s)
  if (result.won && result.durationMs < 30_000) {
    await unlockAchievement(userId, "G5_01_FAST_WIN")
  }

  // Flawless + fast
  if (
    result.won &&
    result.correctCount === result.totalQuestions &&
    result.durationMs < 30_000
  ) {
    await unlockAchievement(userId, "G5_02_FLAWLESS_FAST")
  }
  // =========================
  // SEASON XP (PHASE 6.2)
  // =========================

  useSeasonStore
    .getState()
    .addSeasonXp(userId, SEASON_XP.DAILY_COMPLETE)
}




