import {
  addQuestionTagsToUsage,
  calculateTagDiversityScore,
  getNormalizedQuestionTags,
  getSessionTagSummary,
} from "@/questions/questionTags";

describe("questionTags", () => {
  it("normalizes duplicate/mixed-case tags", () => {
    expect(getNormalizedQuestionTags({ tags: ["Marvel", "marvel", "Movie Stars"] })).toEqual([
      "marvel",
      "movie-stars",
    ]);
  });

  it("rewards fresh tags and penalizes repeated tags", () => {
    const usedTags = new Set(["marvel"]);
    const usedTagCounts = new Map([["marvel", 2]]);

    const fresh = calculateTagDiversityScore(
      { tags: ["oscars", "actors"] },
      { usedTags, usedTagCounts }
    );
    const repeated = calculateTagDiversityScore(
      { tags: ["marvel", "actors"] },
      { usedTags, usedTagCounts }
    );

    expect(fresh.score).toBeGreaterThan(repeated.score);
    expect(repeated.overlapCount).toBe(1);
  });

  it("updates tag usage counts for selected questions", () => {
    const usedTags = new Set<string>();
    const usedTagCounts = new Map<string, number>();

    addQuestionTagsToUsage({ tags: ["Marvel", "Actors"] }, usedTags, usedTagCounts);
    addQuestionTagsToUsage({ tags: ["marvel"] }, usedTags, usedTagCounts);

    expect(usedTags.has("marvel")).toBe(true);
    expect(usedTagCounts.get("marvel")).toBe(2);
  });

  it("summarizes repeated session tags", () => {
    const summary = getSessionTagSummary([
      { tags: ["marvel", "actors"] },
      { tags: ["marvel", "oscars"] },
    ]);

    expect(summary.uniqueTagCount).toBe(3);
    expect(summary.repeatedTags).toEqual([{ tag: "marvel", count: 2 }]);
  });
});


