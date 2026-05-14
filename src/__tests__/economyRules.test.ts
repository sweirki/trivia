import {
  MAX_BALANCE,
  applyRewardMultipliers,
  applyXpProgress,
  clampBalance,
  getDailyLoginReward,
  getGameCompletionReward,
  getWeekKeyUTC,
  xpRequiredForLevel,
} from "@/economy/economyRules";

describe("economyRules", () => {
  it("clamps balances to a safe integer range", () => {
    expect(clampBalance(-50)).toBe(0);
    expect(clampBalance(12.9)).toBe(12);
    expect(clampBalance(Number.POSITIVE_INFINITY)).toBe(0);
    expect(clampBalance(MAX_BALANCE + 1000)).toBe(MAX_BALANCE);
  });

  it("requires more XP as levels increase", () => {
    expect(xpRequiredForLevel(2)).toBeGreaterThan(xpRequiredForLevel(1));
    expect(xpRequiredForLevel(10)).toBeGreaterThan(xpRequiredForLevel(2));
  });

  it("applies XP progress and handles level-ups", () => {
    const result = applyXpProgress(0, 1, xpRequiredForLevel(1) + 10);

    expect(result.level).toBe(2);
    expect(result.xp).toBe(10);
    expect(result.leveledUp).toBe(true);
  });

  it("applies VIP and boost multipliers without mutating missing optional rewards", () => {
    const reward = applyRewardMultipliers(
      { xp: 100, coins: 50 },
      2,
      { xp: 0.5, coins: 0.1 }
    );

    expect(reward.xp).toBe(210);
    expect(reward.coins).toBe(77);
    expect(reward.gems).toBe(0);
    expect(reward.tickets).toBe(0);
  });

  it("loops daily reward table safely by streak", () => {
    const first = getDailyLoginReward(1);
    const eighth = getDailyLoginReward(8);

    expect(eighth.xp).toBeGreaterThanOrEqual(first.xp);
    expect(eighth.coins).toBeGreaterThanOrEqual(first.coins);
  });

  it("rewards perfect daily games with premium currency and tickets", () => {
    const reward = getGameCompletionReward({
      mode: "daily",
      totalQuestions: 10,
      correct: 10,
      accuracy: 1,
      perfect: true,
    });

    expect(reward.xp).toBeGreaterThan(0);
    expect(reward.coins).toBeGreaterThan(0);
    expect(reward.gems).toBe(2);
    expect(reward.tickets).toBe(1);
  });

  it("creates stable ISO week keys", () => {
    expect(getWeekKeyUTC(new Date("2026-01-05T12:00:00.000Z"))).toMatch(/^2026-W\d{2}$/);
  });
});
