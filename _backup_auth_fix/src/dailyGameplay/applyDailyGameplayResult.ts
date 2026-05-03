import { calculateAccuracy } from "./accuracy";
import { DAILY_GAMEPLAY_CONFIG } from "./config";
import { usePlayerStore } from "@/store/usePlayerStore";

export function applyDailyGameplayResult(
  correctCount: number,
  totalQuestions: number
) {
  const accuracy = calculateAccuracy(correctCount, totalQuestions);

  const passed =
    accuracy >= DAILY_GAMEPLAY_CONFIG.MIN_ACCURACY_TO_KEEP_STREAK;

  const player = usePlayerStore.getState();

  if (passed) {
    player.incrementDailyStreak();
  } else {
    player.resetDailyStreak();
  }

  return {
    accuracy,
    passed,
    perfect:
      accuracy === DAILY_GAMEPLAY_CONFIG.PERFECT_ACCURACY,
  };
}
