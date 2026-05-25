jest.mock("../questions/questionSession", () => ({
  buildQuestionSession: ({ count = 10 }) => ({
    questions: Array.from({ length: count }, (_, index) => {
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
  buildArenaQuestions,
  buildGameplayQuestions,
  buildPowerArenaQuestions,
} from "@/questions/gameplayQuestions";

describe("Q10 gameplay question adapters", () => {
  it("builds ranked arena questions from the question engine", () => {
    const questions = buildArenaQuestions("ranked", 5);

    expect(questions).toHaveLength(5);
    expect(questions[0]).toEqual(
      expect.objectContaining({
        text: expect.any(String),
        question: expect.any(String),
        answers: expect.any(Array),
        options: expect.any(Array),
        correctAnswer: expect.any(String),
        correctAnswerIndex: expect.any(Number),
        correct: expect.any(String),
        category: expect.any(String),
      })
    );
  });

  it("builds survival arena runs without legacy samples", () => {
    const questions = buildArenaQuestions("survival", 12);

    expect(questions).toHaveLength(12);
    expect(new Set(questions.map((question) => String(question.id))).size).toBe(12);
  });

  it("builds deterministic seeded tournament-compatible questions", () => {
    const first = buildGameplayQuestions({
      mode: "tournament",
      count: 5,
      seed: "q10:tournament:test",
      allowPremium: false,
    }).map((question) => question.id);

    const second = buildGameplayQuestions({
      mode: "tournament",
      count: 5,
      seed: "q10:tournament:test",
      allowPremium: false,
    }).map((question) => question.id);

    expect(second).toEqual(first);
  });

  it("builds power arena questions in the PowerMatch legacy shape", () => {
    const questions = buildPowerArenaQuestions(5);

    expect(questions).toHaveLength(5);
    expect(questions.every((question) => question.correct === question.correctAnswer)).toBe(true);
    expect(questions.every((question) => question.options.length === 4)).toBe(true);
  });
});


