import {
  DEFAULT_QUESTION_ANALYTICS_STATE,
  getQuestionAnalyticsSummary,
  normalizeQuestionAnalyticsState,
  recordQuestionAnalyticsResult,
} from "@/questions/questionAnalytics";

describe("questionAnalytics", () => {
  it("records totals and difficulty/category buckets", () => {
    const first = recordQuestionAnalyticsResult(DEFAULT_QUESTION_ANALYTICS_STATE, {
      questionId: "cars_001",
      category: "cars",
      difficulty: "easy",
      correct: true,
      answerTimeMs: 2000,
    });

    const second = recordQuestionAnalyticsResult(first, {
      questionId: "cars_002",
      category: "cars",
      difficulty: "hard",
      correct: false,
      answerTimeMs: 4000,
    });

    expect(second.totalAnswered).toBe(2);
    expect(second.totalCorrect).toBe(1);
    expect(second.rollingAccuracy).toBe(50);
    expect(second.byCategory.cars.attempts).toBe(2);
    expect(second.byDifficulty.easy.correct).toBe(1);
    expect(second.averageAnswerTimeMs).toBe(3000);
  });

  it("flags questions with suspicious accuracy after enough attempts", () => {
    let state = DEFAULT_QUESTION_ANALYTICS_STATE;

    for (let i = 0; i < 3; i += 1) {
      state = recordQuestionAnalyticsResult(state, {
        questionId: "bad_question",
        category: "movies",
        difficulty: "medium",
        correct: false,
      });
    }

    expect(state.byQuestion.bad_question.signal).toBe("too_hard");
    expect(state.flaggedQuestionIds).toContain("bad_question");
  });

  it("normalizes malformed persisted state safely", () => {
    const normalized = normalizeQuestionAnalyticsState({
      totalAnswered: -10,
      byDifficulty: {
        easy: { attempts: 2, correct: 1, wrong: 1, accuracy: 50, averageAnswerTimeMs: 1000 },
      } as any,
      recentResults: [
        {
          questionId: "q1",
          difficulty: "unknown" as any,
          correct: true,
          category: "Sci Fi",
        },
      ],
    });

    expect(normalized.totalAnswered).toBe(0);
    expect(normalized.recentResults[0]?.difficulty).toBe("easy");
    expect(normalized.recentResults[0]?.category).toBe("sci-fi");
  });

  it("returns a compact summary", () => {
    const state = recordQuestionAnalyticsResult(DEFAULT_QUESTION_ANALYTICS_STATE, {
      questionId: "q1",
      category: "general",
      difficulty: "easy",
      correct: true,
    });

    expect(getQuestionAnalyticsSummary(state)).toMatchObject({
      totalAnswered: 1,
      rollingAccuracy: 100,
    });
  });
});
