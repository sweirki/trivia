import { buildQuestionSession } from "@/questions/questionSession";

describe("question session answer shuffle", () => {
  it("keeps the correct answer valid after shuffling answer choices", () => {
    const session = buildQuestionSession({
      mode: "sudden",
      category: "memes",
      count: 10,
      allowPremium: true,
      seed: "answer-shuffle-test",
    });

    expect(session.questions.length).toBeGreaterThan(0);

    for (const question of session.questions) {
      expect(question.answers[question.correctAnswerIndex]).toBe(
        question.correctAnswer
      );
    }
  });

  it("can produce different first questions for different quick-play seeds", () => {
    const first = buildQuestionSession({
      mode: "sudden",
      category: "memes",
      count: 10,
      allowPremium: true,
      seed: "quick-seed-a",
    }).questions.map((question) => question.id);

    const second = buildQuestionSession({
      mode: "sudden",
      category: "memes",
      count: 10,
      allowPremium: true,
      seed: "quick-seed-b",
    }).questions.map((question) => question.id);

    expect(first.join(",")).not.toBe(second.join(","));
  });
});


