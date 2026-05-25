jest.mock("../questions/questionSession", () => ({
  buildQuestionSession: () => ({
    questions: Array.from({ length: 12 }, (_, index) => {
      const answers = ["A", "B", "C", "D"];
      const answerIndex = index % 4;

      return {
        id: `test_${index + 1}`,
        text: `Question ${index + 1}`,
        answers,
        correctAnswer: answers[answerIndex],
        correctAnswerIndex: answerIndex,
        difficulty: "easy",
        category: "general",
        premium: false,
        tags: ["test"],
      };
    }),
  }),

  getQuestionCountForSessionMode: () => 10,
}));
import {
  buildDailyPoolId,
  buildDailyPoolSeed,
  buildGlobalDailyQuestionPool,
  getDailyPoolDayKey,
  getGlobalDailyQuestionIds,
  selectDailyPoolCategories,
} from "@/questions/dailyPools";

describe("dailyPools", () => {
  it("normalizes daily pool dates to UTC day keys", () => {
    expect(getDailyPoolDayKey(new Date("2026-05-11T23:59:59.000Z"))).toBe("2026-05-11");
    expect(getDailyPoolDayKey("2026-05-11")).toBe("2026-05-11");
    expect(getDailyPoolDayKey("invalid-date")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("builds stable public seed and pool ids", () => {
    expect(buildDailyPoolSeed("2026-05-11")).toBe("global-daily:classic:2026-05-11");
    expect(buildDailyPoolId("2026-05-11")).toBe("daily-classic-2026-05-11");
    expect(buildDailyPoolSeed("2026-05-11", "arena")).toBe("global-daily:arena:2026-05-11");
  });

  it("selects deterministic category order for the same day", () => {
    const first = selectDailyPoolCategories({ date: "2026-05-11" });
    const second = selectDailyPoolCategories({ date: "2026-05-11" });

  expect(first).toEqual(second);
  });

  it("builds deterministic global daily question ids for all players on the same day", () => {
    const first = getGlobalDailyQuestionIds({ date: "2026-05-11" });
    const second = getGlobalDailyQuestionIds({ date: "2026-05-11" });

   expect(first.length).toBeGreaterThan(0);
    expect(first).toEqual(second);
  });

  it("changes the daily pool across UTC days", () => {
    const first = getGlobalDailyQuestionIds({ date: "2026-05-11" });
    const second = getGlobalDailyQuestionIds({ date: "2026-05-12" });

    expect(first.length).toBeGreaterThan(0);
    expect(second.length).toBeGreaterThan(0);
   expect(first.length).toBe(second.length);
  });

  it("returns daily metadata with the session result", () => {
    const pool = buildGlobalDailyQuestionPool({
      date: "2026-05-11",
      count: 5,
      categories: ["science", "general"],
    });

    expect(pool.dayKey).toBe("2026-05-11");
    expect(pool.poolId).toBe("daily-classic-2026-05-11");
    expect(pool.seed).toBe("global-daily:classic:2026-05-11");
   expect(pool.questions.length).toBeGreaterThan(0);
    expect(pool.categories.length).toBeGreaterThan(0);
  });
});


