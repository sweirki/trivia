import {
  calculateBaseXP,
  calculateSpeedBonus,
  calculateSuddenDeathBonusXP,
  calculateTimedBonus,
  limitQuestionsForMode,
  resolvePlayableCategoryId,
} from "@/store/quickGame.helpers";

const makeQuestions = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: index,
    text: `Question ${index}`,
    answers: ["A", "B"],
    correctAnswerIndex: 0,
    difficulty: "easy" as const,
    category: "science",
  }));

describe("quick game helpers", () => {
  it("limits question counts by mode", () => {
    const questions = makeQuestions(20);

    expect(limitQuestionsForMode("classic", questions)).toHaveLength(10);
    expect(limitQuestionsForMode("speed", questions)).toHaveLength(15);
    expect(limitQuestionsForMode("daily", questions)).toHaveLength(7);
    expect(limitQuestionsForMode("timed60", questions)).toHaveLength(20);
  });

  it("falls back to a playable category for invalid category values", () => {
    expect(resolvePlayableCategoryId(null)).toBeTruthy();
    expect(resolvePlayableCategoryId("daily")).toBeTruthy();
    expect(resolvePlayableCategoryId("not-a-category")).toBeTruthy();
  });

  it("calculates XP bonuses without changing gameplay values", () => {
    expect(calculateBaseXP("easy", "classic")).toBe(8);
    expect(calculateBaseXP("medium", "classic")).toBe(12);
    expect(calculateBaseXP("hard", "sudden")).toBe(24);
    expect(calculateSuddenDeathBonusXP(10)).toBe(80);
  });

  it("calculates mode completion bonuses", () => {
    expect(calculateSpeedBonus({ total: 15, correct: 15, wrong: 0, accuracy: 100 })).toEqual({
      bonusXP: 80,
      bonusCoins: 3,
    });

    expect(calculateTimedBonus("timed90", { total: 30, correct: 25, wrong: 5, accuracy: 83 })).toEqual({
      bonusXP: 165,
      bonusCoins: 2,
    });
  });
});
