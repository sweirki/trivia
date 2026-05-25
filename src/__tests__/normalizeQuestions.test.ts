import { normalizeQuestions } from "@/questions/normalizeQuestions";

describe("normalizeQuestions", () => {
  it("normalizes supported question shapes", () => {
    const [question] = normalizeQuestions([
      {
        id: "q1",
        category: "Science",
        premium: true,
        difficulty: "hard",
        question: "What planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Venus", "Jupiter"],
        correctAnswer: "Mars",
        explanation: "Mars is often called the Red Planet because of iron oxide on its surface.",
        tags: ["Planets", "Solar System"],
      },
    ]);

    expect(question).toEqual({
      id: "q1",
      category: "science",
      premium: true,
      difficulty: "hard",
      text: "What planet is known as the Red Planet?",
      answers: ["Earth", "Mars", "Venus", "Jupiter"],
      correctAnswer: "Mars",
      correctAnswerIndex: 1,
      explanation: "Mars is often called the Red Planet because of iron oxide on its surface.",
      tags: ["science", "hard", "planets", "solar-system"],
    });
  });

  it("supports legacy correct field", () => {
    const [question] = normalizeQuestions([
      {
        id: 1,
        category: "Cars",
        difficulty: "easy",
        text: "Which Japanese sports car is nicknamed Godzilla?",
        answers: ["Nissan GT-R", "Toyota Supra", "Mazda RX-7", "Honda NSX"],
        correct: "Nissan GT-R",
      },
    ]);

    expect(question.correctAnswer).toBe("Nissan GT-R");
    expect(question.correctAnswerIndex).toBe(0);
    expect(question.category).toBe("cars");
  });

  it("uses correctAnswerIndex when present", () => {
    const [question] = normalizeQuestions([
      {
        id: 2,
        text: "2 + 2?",
        answers: ["3", "4", "5", "6"],
        correctAnswerIndex: 1,
      },
    ]);

    expect(question.correctAnswer).toBe("4");
    expect(question.correctAnswerIndex).toBe(1);
  });

  it("throws for empty question text", () => {
    expect(() =>
      normalizeQuestions([
        {
          id: "bad",
          text: "",
          answers: ["A", "B", "C", "D"],
          correctAnswerIndex: 0,
        },
      ])
    ).toThrow(/Missing question text/);
  });

  it("throws when answers do not have exactly four choices", () => {
    expect(() =>
      normalizeQuestions([
        {
          id: "bad-answers",
          text: "Pick one",
          answers: ["A", "B"],
          correctAnswer: "A",
        },
      ])
    ).toThrow(/expected exactly 4 answers/);
  });

  it("throws when the correct answer is not in answers", () => {
    expect(() =>
      normalizeQuestions([
        {
          id: "bad-answer",
          text: "Pick one",
          answers: ["A", "B", "C", "D"],
          correctAnswer: "Z",
        },
      ])
    ).toThrow(/Correct answer not found/);
  });
});


