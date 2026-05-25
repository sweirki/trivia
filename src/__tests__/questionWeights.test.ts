import {
  calculateQuestionWeight,
  pickWeightedQuestion,
  rankWeightedQuestionCandidates,
} from "@/questions/questionWeights";
import type { NormalizedQuestion } from "@/questions/types";

const makeQuestion = (
  id: string,
  overrides: Partial<NormalizedQuestion> = {}
): NormalizedQuestion => ({
  id,
  text: `Question ${id}`,
  answers: ["A", "B", "C", "D"],
  correctAnswer: "A",
  correctAnswerIndex: 0,
  difficulty: "medium",
  category: "cars",
  premium: false,
  tags: [],
  ...overrides,
});

describe("questionWeights", () => {
  it("prefers target difficulty over distant difficulty", () => {
    const easy = makeQuestion("easy", { difficulty: "easy" });
    const hard = makeQuestion("hard", { difficulty: "hard" });

    const easyWeight = calculateQuestionWeight(easy, {
      targetDifficulty: "easy",
      rng: () => 0,
    }).weight;

    const hardWeight = calculateQuestionWeight(hard, {
      targetDifficulty: "easy",
      rng: () => 0,
    }).weight;

    expect(easyWeight).toBeGreaterThan(hardWeight);
  });

  it("penalizes repeated tags to improve session diversity", () => {
    const fresh = makeQuestion("fresh", { tags: ["classic-cars"] });
    const repeated = makeQuestion("repeated", { tags: ["nissan"] });

    const usedTags = new Set(["nissan"]);

    const ranked = rankWeightedQuestionCandidates([repeated, fresh], {
      targetDifficulty: "medium",
      usedTags,
      rng: () => 0,
    });

    expect(ranked[0]?.question.id).toBe("fresh");
  });

  it("removes premium questions when premium is not allowed", () => {
    const premium = makeQuestion("premium", { premium: true });
    const free = makeQuestion("free");

    const picked = pickWeightedQuestion([premium, free], {
      allowPremium: false,
      rng: () => 0,
    });

    expect(picked?.id).toBe("free");
  });

  it("removes excluded questions from weighted selection", () => {
    const excluded = makeQuestion("excluded");
    const available = makeQuestion("available");

    const picked = pickWeightedQuestion([excluded, available], {
      excludedQuestionIds: new Set(["excluded"]),
      rng: () => 0,
    });

    expect(picked?.id).toBe("available");
  });
});


