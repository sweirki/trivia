import {
  assertPlayableQuestion,
  filterPlayableQuestions,
  getQuestionGuardIssues,
} from "@/questions/questionGuards";
import type { NormalizedQuestion } from "@/questions/types";

const baseQuestion: NormalizedQuestion = {
  id: "guard_1",
  category: "memes",
  premium: false,
  difficulty: "easy",
  text: "What does sus mean?",
  answers: ["Suspicious", "Based", "Ratio", "Cringe"],
  correctAnswer: "Suspicious",
  correctAnswerIndex: 0,
  tags: ["memes", "easy"],
};

describe("questionGuards", () => {
  it("accepts playable questions", () => {
    expect(getQuestionGuardIssues(baseQuestion)).toEqual([]);
    expect(() => assertPlayableQuestion(baseQuestion)).not.toThrow();
  });

  it("rejects duplicate answer choices", () => {
    const question = {
      ...baseQuestion,
      answers: ["Sus", "Sus", "Based", "Ratio"],
      correctAnswer: "Sus",
      correctAnswerIndex: 0,
    };

    expect(getQuestionGuardIssues(question)).toContain("duplicate-answers");
    expect(filterPlayableQuestions([baseQuestion, question])).toEqual([baseQuestion]);
  });

  it("rejects mismatched correct answer indexes", () => {
    const question = {
      ...baseQuestion,
      correctAnswer: "Suspicious",
      correctAnswerIndex: 1,
    };

    expect(getQuestionGuardIssues(question)).toContain("missing-correct-answer");
    expect(() => assertPlayableQuestion(question)).toThrow(/not playable/);
  });
});
