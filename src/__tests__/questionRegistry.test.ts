import {
  getDifficultyBreakdown,
  getPlayableQuestionPacks,
  getQuestionCount,
  getQuestionPack,
  getRandomQuestionsByCategory,
  getRegistryIssues,
  getQuestionsByDifficulty,
  getMixedQuestionPool,
} from "@/questions/questionRegistry";

describe("questionRegistry", () => {
  it("groups category folders into playable category packs", () => {
    const cars = getQuestionPack("cars");

    expect(cars?.id).toBe("cars");
    expect(cars?.packCount).toBeGreaterThan(1);
    expect(cars?.questionCount).toBeGreaterThan(0);
    expect(cars?.metadata.displayName).toBe("Cars");
  });

  it("exposes registry analytics", () => {
    expect(getQuestionCount()).toBeGreaterThan(0);
    expect(getQuestionCount("cars")).toBeGreaterThan(0);
    expect(getDifficultyBreakdown("cars").easy).toBeGreaterThan(0);
  });

  it("returns filtered and random question pools", () => {
    expect(getQuestionsByDifficulty("cars", "easy").length).toBeGreaterThan(0);
    expect(getRandomQuestionsByCategory("cars", 3)).toHaveLength(3);
    expect(getMixedQuestionPool(["cars", "movies"]).length).toBeGreaterThan(0);
  });

  it("keeps empty packs as warnings instead of hard failures", () => {
    expect(getRegistryIssues().some((issue) => issue.type === "empty-pack")).toBe(true);
    expect(getPlayableQuestionPacks().length).toBeGreaterThan(0);
  });
});
