import { evaluateDailyClaim, getNextDailyStreak } from "@/daily/dailyLogic";

describe("dailyLogic", () => {
  it("starts a new streak when there is no previous claim", () => {
    expect(evaluateDailyClaim(null, "2026-05-10", 0)).toEqual({
      canClaim: true,
      nextStreak: 1,
      isNewStreak: true,
      alreadyClaimedToday: false,
      daysSinceLastClaim: null,
    });
  });

  it("keeps the claimed day stable after today has already been claimed", () => {
    expect(evaluateDailyClaim("2026-05-10", "2026-05-10", 1)).toMatchObject({
      canClaim: false,
      nextStreak: 1,
      alreadyClaimedToday: true,
    });
  });

  it("advances to day two on the next UTC day", () => {
    expect(evaluateDailyClaim("2026-05-10", "2026-05-11", 1)).toMatchObject({
      canClaim: true,
      nextStreak: 2,
      isNewStreak: false,
    });
  });

  it("wraps the seven day reward track safely", () => {
    expect(getNextDailyStreak(7, false)).toBe(1);
  });

  it("resets the streak after a missed day", () => {
    expect(evaluateDailyClaim("2026-05-10", "2026-05-12", 4)).toMatchObject({
      canClaim: true,
      nextStreak: 1,
      isNewStreak: true,
    });
  });
});
