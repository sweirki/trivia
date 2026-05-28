export type AnswerTone = "correct" | "wrong" | "sudden";
export type Difficulty = "easy" | "medium" | "hard" | "expert" | string;

export type AnswerFeedbackCopyInput = {
  wasCorrect: boolean;
  isSuddenDeathLoss: boolean;
  nextStreak: number;
  difficulty?: Difficulty;
};

export type AnswerFeedbackCopy = {
  text: string;
  tone: AnswerTone;
};

export function getAnswerFeedbackCopy({
  wasCorrect,
  isSuddenDeathLoss,
  nextStreak,
  difficulty,
}: AnswerFeedbackCopyInput): AnswerFeedbackCopy {
  if (isSuddenDeathLoss) {
    return {
      text: "Sudden Death over — one wrong answer ends the round!",
      tone: "sudden",
    };
  }

  if (!wasCorrect) {
    return {
      text: "Missed. Reset, breathe, and steal the next one.",
      tone: "wrong",
    };
  }

  if (nextStreak >= 10) {
    return {
      text: `Unstoppable! ${nextStreak} answer streak.`,
      tone: "correct",
    };
  }

  if (nextStreak >= 5) {
    return {
      text: `Hot streak! ${nextStreak} in a row.`,
      tone: "correct",
    };
  }

  if (difficulty === "hard" || difficulty === "expert") {
    return {
      text: "Correct on a tough one. Momentum gained.",
      tone: "correct",
    };
  }

  return {
    text: "Correct. Keep the chain alive.",
    tone: "correct",
  };
}

export function getAnswerFeedbackDelayMs(tone: AnswerTone, nextStreak: number) {
  if (tone === "sudden") return 760;
  if (nextStreak > 0 && nextStreak % 5 === 0) return 520;
  return 320;
}

export function getStreakTier(streak: number) {
  if (streak >= 10) {
    return {
      label: "UNSTOPPABLE",
      hint: "Legend pace",
      multiplier: "3x",
    };
  }

  if (streak >= 5) {
    return {
      label: "ON FIRE",
      hint: "Combo pressure",
      multiplier: "2x",
    };
  }

  if (streak >= 3) {
    return {
      label: "HEATING UP",
      hint: "Streak building",
      multiplier: "1.5x",
    };
  }

  return {
    label: "BUILD MOMENTUM",
    hint: "Chain correct answers",
    multiplier: "1x",
  };
}

export type ResultWowInput = {
  accuracy: number;
  correct: number;
  total: number;
  mode?: string | null;
  earnedXP?: number;
  earnedCoins?: number;
  earnedGems?: number;
  earnedTickets?: number;
};

export function getResultWowMoment({
  accuracy,
  correct,
  total,
  mode,
  earnedXP = 0,
  earnedCoins = 0,
  earnedGems = 0,
  earnedTickets = 0,
}: ResultWowInput) {
  const perfect = total > 0 && correct === total;
  const totalRewards = earnedXP + earnedCoins + earnedGems + earnedTickets;

  if (perfect) {
    return {
      eyebrow: "PERFECT CLEAR",
      headline: "Flawless Run",
      body: "No mistakes. That is the round players remember.",
      cta: mode === "daily" ? "Claim Daily Momentum" : "Run It Back",
    };
  }

  if (accuracy >= 90) {
    return {
      eyebrow: "ELITE PRESSURE",
      headline: "Almost Untouchable",
      body: "One cleaner answer turns this into a perfect showcase.",
      cta: "Chase Perfect",
    };
  }

  if (accuracy >= 75) {
    return {
      eyebrow: "RANK CLIMBER",
      headline: "Strong Control",
      body: totalRewards > 0
        ? "Good accuracy plus rewards. This is a clean progression loop."
        : "Good accuracy. Push the streak higher next run.",
      cta: "Keep Climbing",
    };
  }

  if (accuracy >= 50) {
    return {
      eyebrow: "COMEBACK WINDOW",
      headline: "You’re Close",
      body: "A better streak in the middle of the round changes everything.",
      cta: "Start Comeback",
    };
  }

  return {
    eyebrow: "TRAINING RUN",
    headline: "Reset And Strike Back",
    body: "The next run should feel faster because you now know the pressure.",
    cta: "Try Again",
  };
}

export function getProgressDramaCopy(questionNumber: number, totalQuestions: number, streak: number) {
  const remaining = Math.max(0, totalQuestions - questionNumber);

  if (remaining === 0) return "FINAL QUESTION";
  if (streak >= 5) return "STREAK BONUS LIVE";
  if (remaining <= 2) return "CLOSING STRETCH";
  return "BUILD MOMENTUM";
}


