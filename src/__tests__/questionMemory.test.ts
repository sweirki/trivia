import {
  MAX_RECENT_QUESTION_IDS,
  mergeRecentQuestionIds,
  normalizeQuestionId,
  normalizeRecentQuestionIds,
} from "@/questions/questionMemory";

describe("questionMemory", () => {
  it("normalizes question ids", () => {
    expect(normalizeQuestionId(123)).toBe("123");
    expect(normalizeQuestionId(" abc ")).toBe("abc");
    expect(normalizeQuestionId("")).toBeNull();
    expect(normalizeQuestionId(null)).toBeNull();
  });

  it("keeps newest IDs first and deduplicates", () => {
    expect(mergeRecentQuestionIds(["1", "2", "3"], [3, 4, 5])).toEqual([
      "3",
      "4",
      "5",
      "1",
      "2",
    ]);
  });

  it("limits recent memory size", () => {
    const ids = Array.from({ length: MAX_RECENT_QUESTION_IDS + 20 }, (_, index) => index);
    expect(normalizeRecentQuestionIds(ids)).toHaveLength(MAX_RECENT_QUESTION_IDS);
  });
});


