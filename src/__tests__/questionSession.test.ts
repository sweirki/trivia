import {
  buildQuestionSession,
  getQuestionCountForSessionMode,
} from "@/questions/questionSession";

describe("questionSession", () => {
  it("builds a curated classic session from category packs", () => {
    const session = buildQuestionSession({
      mode: "classic",
      category: "cars",
      count: 10,
      seed: "classic-cars-test",
    });

    expect(session.questions).toHaveLength(10);
    expect(session.returnedCount).toBe(10);
    expect(session.questions.every((question) => question.category === "cars")).toBe(true);
  });

  it("respects excluded question ids when enough alternatives exist", () => {
    const firstSession = buildQuestionSession({
      mode: "classic",
      category: "cars",
      count: 5,
      seed: "exclude-source",
    });

    const excludedIds = firstSession.questions.map((question) => question.id);

    const secondSession = buildQuestionSession({
      mode: "classic",
      category: "cars",
      count: 5,
      seed: "exclude-source",
      excludeQuestionIds: excludedIds,
    });

    expect(secondSession.questions.some((question) => excludedIds.includes(question.id))).toBe(false);
  });

  it("uses deterministic seeded sessions for daily-style pools", () => {
    const first = buildQuestionSession({
      mode: "daily",
      category: "movies",
      count: 7,
      seed: "2026-05-11",
    });

    const second = buildQuestionSession({
      mode: "daily",
      category: "movies",
      count: 7,
      seed: "2026-05-11",
    });

    expect(first.questions.map((question) => question.id)).toEqual(
      second.questions.map((question) => question.id)
    );
  });

  it("exposes mode counts", () => {
    expect(getQuestionCountForSessionMode("classic")).toBe(10);
    expect(getQuestionCountForSessionMode("speed")).toBe(15);
    expect(getQuestionCountForSessionMode("daily")).toBe(7);
  });
});


