// src/polish/launchPolish.ts
// Phase 6: small pure helpers for launch-polish nudges.
// Kept dependency-free so it is safe for app runtime, Jest, and release checks.

export type PostMatchLaunchInput = {
  accuracy: number;
  score: number;
  totalQuestions: number;
  earnedXP: number;
  earnedCoins: number;
  earnedGems: number;
  earnedTickets: number;
  mode?: string | null;
  hasVip?: boolean;
  hasChallenge?: boolean;
};

export type PostMatchLaunchAction = {
  eyebrow: string;
  title: string;
  body: string;
  ctaHint: string;
};

function normalizeAccuracy(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function getPostMatchLaunchAction(input: PostMatchLaunchInput): PostMatchLaunchAction {
  const accuracy = normalizeAccuracy(input.accuracy);
  const totalReward =
    Math.max(0, input.earnedXP) +
    Math.max(0, input.earnedCoins) +
    Math.max(0, input.earnedGems) * 4 +
    Math.max(0, input.earnedTickets) * 8;

  if (input.hasChallenge) {
    return {
      eyebrow: "RIVALRY MOMENT",
      title: "Set up the rematch.",
      body: "Competitive results hit harder when the next opponent is one tap away.",
      ctaHint: "Open Challenges from the hub.",
    };
  }

  if (accuracy >= 90) {
    return {
      eyebrow: "ELITE RUN",
      title: "Protect the streak.",
      body: "This was a top-tier match. Keep the pressure on before the rhythm fades.",
      ctaHint: "Play again while you are hot.",
    };
  }

  if (accuracy >= 70) {
    return {
      eyebrow: "NEAR BREAKTHROUGH",
      title: "One cleaner run levels this up.",
      body: "Your accuracy is close to a premium result. A rematch is the fastest improvement path.",
      ctaHint: "Replay the mode now.",
    };
  }

  if (totalReward > 0) {
    return {
      eyebrow: "PROGRESSION SAVED",
      title: "Bank the reward, then rebound.",
      body: "Even rough runs should move the account forward. Use the reward momentum.",
      ctaHint: "Collect, reset, and try again.",
    };
  }

  return {
    eyebrow: "NEXT RUN READY",
    title: "Warm up complete.",
    body: "Trivia retention improves when the next match starts before the session cools down.",
    ctaHint: "Start another quick match.",
  };
}

export function getLaunchPolishChecklistScore(flags: {
  hasSocialEntry: boolean;
  hasDailyEntry: boolean;
  hasStoreEntry: boolean;
  hasSettingsEntry: boolean;
  hasObservableEnv: boolean;
}) {
  const checks = [
    flags.hasSocialEntry,
    flags.hasDailyEntry,
    flags.hasStoreEntry,
    flags.hasSettingsEntry,
    flags.hasObservableEnv,
  ];
  const passed = checks.filter(Boolean).length;

  return {
    passed,
    total: checks.length,
    percent: Math.round((passed / checks.length) * 100),
  };
}


