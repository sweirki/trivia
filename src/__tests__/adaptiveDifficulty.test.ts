import {
  DEFAULT_ADAPTIVE_DIFFICULTY_STATE,
  getAdaptivePreferredDifficulty,
  recordAdaptiveQuestionResult,
} from "@/questions/adaptiveDifficulty";

describe("adaptiveDifficulty", () => {
  it("starts casual players on easy until confidence exists", () => {
    expect(getAdaptivePreferredDifficulty(DEFAULT_ADAPTIVE_DIFFICULTY_STATE, "classic")).toBe("easy");
  });

  it("promotes players after strong recent performance", () => {
    let state = DEFAULT_ADAPTIVE_DIFFICULTY_STATE;

    for (let i = 0; i < 10; i += 1) {
      state = recordAdaptiveQuestionResult(state, {
        questionId: `q-${i}`,
        difficulty: "medium",
        correct: true,
      });
    }

    expect(state.rollingAccuracy).toBe(100);
    expect(state.preferredDifficulty).toBe("hard");
    expect(getAdaptivePreferredDifficulty(state, "classic")).toBe("hard");
  });

  it("protects struggling players by reducing difficulty", () => {
    let state = DEFAULT_ADAPTIVE_DIFFICULTY_STATE;

    for (let i = 0; i < 10; i += 1) {
      state = recordAdaptiveQuestionResult(state, {
        questionId: `q-${i}`,
        difficulty: "hard",
        correct: i < 3,
      });
    }

    expect(state.rollingAccuracy).toBe(30);
    expect(state.preferredDifficulty).toBe("medium");
  });

  it("keeps competitive modes stable", () => {
    let state = DEFAULT_ADAPTIVE_DIFFICULTY_STATE;

    for (let i = 0; i < 12; i += 1) {
      state = recordAdaptiveQuestionResult(state, {
        questionId: `q-${i}`,
        difficulty: "hard",
        correct: true,
      });
    }

    expect(getAdaptivePreferredDifficulty(state, "ranked")).toBe("medium");
    expect(getAdaptivePreferredDifficulty(state, "daily")).toBe("medium");
  });
});


