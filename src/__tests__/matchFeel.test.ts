import {
  getAnswerFeedbackCopy,
  getAnswerFeedbackDelayMs,
  getProgressDramaCopy,
  getResultWowMoment,
  getStreakTier,
} from "@/play/core/matchFeel";

describe("match feel helpers", () => {
  it("celebrates perfect result as the strongest wow moment", () => {
    expect(
      getResultWowMoment({
        accuracy: 100,
        correct: 10,
        total: 10,
        mode: "classic",
      }),
    ).toMatchObject({
      eyebrow: "PERFECT CLEAR",
      headline: "Flawless Run",
      cta: "Run It Back",
    });
  });

  it("uses daily-specific CTA for a perfect daily", () => {
    expect(
      getResultWowMoment({
        accuracy: 100,
        correct: 7,
        total: 7,
        mode: "daily",
      }).cta,
    ).toBe("Claim Daily Momentum");
  });

  it("makes streak feedback more dramatic at milestones", () => {
    expect(
      getAnswerFeedbackCopy({
        wasCorrect: true,
        isSuddenDeathLoss: false,
        nextStreak: 5,
      }),
    ).toMatchObject({
      text: "Hot streak! 5 in a row.",
      tone: "correct",
    });

    expect(getAnswerFeedbackDelayMs("correct", 5)).toBeGreaterThan(
      getAnswerFeedbackDelayMs("correct", 1),
    );
  });

  it("surfaces momentum states for the in-match HUD", () => {
    expect(getStreakTier(0).label).toBe("BUILD MOMENTUM");
    expect(getStreakTier(5).label).toBe("ON FIRE");
    expect(getProgressDramaCopy(10, 10, 0)).toBe("FINAL QUESTION");
  });
});


