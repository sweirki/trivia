// /store/useQuickGameStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getAdaptivePreferredDifficulty } from "@/questions/adaptiveDifficulty";
import { loadCategoryQuestions } from "@/questions/loadCategoryQuestions";
import { useAchievementsStore } from "./achievementsStore";
import { useRankedArenaStore } from "@/arena/ranked/useRankedArenaStore";
import { useSurvivalArenaStore } from "@/arena/survival/useSurvivalArenaStore";
import { usePlayerStore } from "@/store/player/player.store";
import {
  buildCuratedQuestionsForMode,
  calculateBaseXP,
  calculateSpeedBonus,
  calculateSuddenDeathBonusXP,
  calculateTimedBonus,
  clearGameTimer,
  createFreshGameState,
  getQuestionPool,
  resolvePlayableCategoryId,
} from "./quickGame.helpers";



const legacyFallbackQuestions: QuickQuestion[] = [];

const recordQuestionsSeen = (questions: QuickQuestion[]) => {
  if (!questions.length) return;

  usePlayerStore
    .getState()
    .recordRecentQuestions(questions.map((question) => question.id));
};

// ---------------------------------------------------------
// TYPES
// ---------------------------------------------------------
export type QuickMode =
  | "classic"
  | "speed"
  | "timed60"
  | "timed90"
  | "sudden"
  | "ranked"
  | "survival"
  | "daily"
  | null;


  
type Difficulty = "easy" | "medium" | "hard" | "expert";
type GameContext = "quick" | "tournament";
type GameTimer = ReturnType<typeof setInterval>;

type QuickQuestion = {
  id: number | string;
  text: string;
  answers: string[];
  correctAnswerIndex: number | string;
  difficulty: Difficulty;
  category: string;
};

type AnswerHistoryItem = {
  questionId: number | string;
  chosen: string;
  correct: boolean;
  difficulty: Difficulty;
  category: string;
};

type DailyResult = {
  accuracy: number;
  passed: boolean;
  perfect: boolean;
};

type Summary = {
  total: number;
  correct: number;
  wrong: number;
  accuracy: number;
};

type QuickGameState = {
  earnedXP: number;
  earnedCoins: number;
  earnedGems: number;
  earnedTickets: number;
  dailyResult: DailyResult | null;

  started: boolean;
  gameOver: boolean;
  gameContext: GameContext;
  mode: QuickMode;

  category: string | null;

  questions: QuickQuestion[];
  idx: number;

  score: number;
  streak: number;
  combo: number;

  timeLeft: number | null;
  timerId: GameTimer | null;

  answerHistory: AnswerHistoryItem[];

  getSummary: () => Summary;
  getDifficultyLevel: () => Difficulty;

  setDailyResult: (result: DailyResult) => void;
  setCategory: (id: string) => void;
  clearTimer: () => void;

  initGame: (mode: QuickMode, category: string) => void;
  initTournamentGame: (category: string, questionsCount: number) => void;
  handleAnswer: (choice: string) => boolean;

  resetGame: () => void;
};

// ---------------------------------------------------------
// STORE
// ---------------------------------------------------------
export const useQuickGameStore = create<QuickGameState>()(
  persist<QuickGameState>(
    (set, get) => ({
      started: false,
      gameOver: false,
      gameContext: "quick",

      mode: null,
      category: null,

      questions: [],
      idx: 0,

      score: 0,
      streak: 0,
      combo: 0,

      timeLeft: null,
      timerId: null,

      answerHistory: [],

      earnedXP: 0,
      earnedCoins: 0,
      earnedGems: 0,
      earnedTickets: 0,
      dailyResult: null,

      getSummary: () => {
        const history = get().answerHistory;
        const correct = history.filter((item) => item.correct).length;
        const total = history.length;

        return {
          total,
          correct,
          wrong: total - correct,
          accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
        };
      },

      getDifficultyLevel: () => {
        const { mode } = get();
        const playerSkill = usePlayerStore.getState().questionSkill;

        return getAdaptivePreferredDifficulty(playerSkill, mode);
      },

      setDailyResult: (result) => set({ dailyResult: result }),

      setCategory: (id) => set({ category: id }),

      clearTimer: () => {
        clearGameTimer(get().timerId);
        set({ timerId: null });
      },

      initGame: (mode, category) => {
        clearGameTimer(get().timerId);

        const survivalRun = useSurvivalArenaStore.getState().currentRun;

        if (survivalRun) {
          const questions = survivalRun.questions as QuickQuestion[];

          set(
            createFreshGameState(
              "survival",
              "survival",
              questions
            )
          );

          recordQuestionsSeen(questions);

          return;
        }

        const rankedMatch = useRankedArenaStore.getState().currentMatch;

        if (rankedMatch) {
          const questions = rankedMatch.questions as QuickQuestion[];

          set(
            createFreshGameState(
              "ranked",
              "ranked",
              questions
            )
          );

          recordQuestionsSeen(questions);

          return;
        }

        const resolvedCategory = resolvePlayableCategoryId(category);
        const basePool = getQuestionPool(
          resolvedCategory,
          "QuickGame",
          loadCategoryQuestions as (category: string) => QuickQuestion[],
          legacyFallbackQuestions
        );

        const preferredDifficulty =
          mode === "speed"
            ? undefined
            : getAdaptivePreferredDifficulty(usePlayerStore.getState().questionSkill, mode);
        const fallbackPool = basePool.length ? basePool : legacyFallbackQuestions;
        const recentQuestionIds = usePlayerStore.getState().recentQuestionIds;
        const questions = buildCuratedQuestionsForMode(mode, resolvedCategory, fallbackPool, {
          preferredDifficulty,
          excludeQuestionIds: recentQuestionIds,
          seed: `quick:${mode ?? "classic"}:${resolvedCategory}:${Date.now()}:${Math.random()}`,
        });

        set(createFreshGameState(mode, resolvedCategory, questions));
        recordQuestionsSeen(questions);

        const duration =
          mode === "timed60" ? 60 : mode === "timed90" ? 90 : 0;

        if (duration <= 0) return;

        set({ timeLeft: duration });

        const timer = setInterval(() => {
          const { timeLeft, gameOver } = get();

          if (gameOver) {
            clearInterval(timer);
            set({ timerId: null });
            return;
          }

          const safeTimeLeft = typeof timeLeft === "number" ? timeLeft : 0;

          if (safeTimeLeft <= 1) {
            clearInterval(timer);
            set({ timeLeft: 0, gameOver: true, timerId: null });
          } else {
            set({ timeLeft: safeTimeLeft - 1 });
          }
        }, 1000);

        set({ timerId: timer });
      },

      initTournamentGame: (category, questionsCount) => {
        const resolvedCategory = resolvePlayableCategoryId(category);

        clearGameTimer(get().timerId);

        const basePool = getQuestionPool(
          resolvedCategory,
          "Tournament",
          loadCategoryQuestions as (category: string) => QuickQuestion[],
          legacyFallbackQuestions
        );
        const fallbackPool = basePool.length ? basePool : legacyFallbackQuestions;
        const recentQuestionIds = usePlayerStore.getState().recentQuestionIds;
        const questions = buildCuratedQuestionsForMode("classic", resolvedCategory, fallbackPool, {
          tournamentCount: questionsCount,
          excludeQuestionIds: recentQuestionIds,
          seed: `tournament:${resolvedCategory}:${questionsCount}:${Date.now()}:${Math.random()}`,
        });

        set(
          createFreshGameState(
            "classic",
            resolvedCategory,
            questions,
            "tournament"
          )
        );
        recordQuestionsSeen(questions);
      },

      handleAnswer: (choice) => {
        const state = get();
        const {
          mode,
          idx,
          questions,
          streak,
          combo,
          category,
          timerId,
          gameContext,
          timeLeft,
          answerHistory,
        } = state;

        const question = questions[idx];

        if (!question) return false;

        const correctAnswerIndex = Number(question.correctAnswerIndex);
        const correct = question.answers[correctAnswerIndex] === choice;
        const survivalRun = useSurvivalArenaStore.getState().currentRun;
        const isTournament = gameContext === "tournament";

        const nextAnswer: AnswerHistoryItem = {
          questionId: question.id,
          chosen: choice,
          correct,
          difficulty: question.difficulty,
          category: question.category,
        };

        const nextAnswerHistory = [...answerHistory, nextAnswer];
        const nextIndex = idx + 1;
        const newStreak = correct ? streak + 1 : 0;
        const newCombo = correct ? combo + 1 : 0;
        const nextCorrectCount = nextAnswerHistory.filter((item) => item.correct).length;

        const deferAchievementProgress = () => {
          if (!correct || isTournament) return;

          setTimeout(() => {
            const achievements = useAchievementsStore.getState();
            achievements.addProgress("combo", 1);
            achievements.addProgress("category", 1, category);
          }, 0);
        };

        if (!correct && survivalRun) {
          useSurvivalArenaStore.getState().endRun();
          clearGameTimer(timerId);

          set({
            answerHistory: nextAnswerHistory,
            gameOver: true,
            timerId: null,
          });

          return correct;
        }

        if (!correct && mode === "sudden") {
          clearGameTimer(timerId);

          const bonusXP =
            !isTournament ? calculateSuddenDeathBonusXP(nextCorrectCount) : 0;

          set((currentState) => ({
            answerHistory: nextAnswerHistory,
            earnedXP: currentState.earnedXP + bonusXP,
            gameOver: true,
            timerId: null,
          }));

          return correct;
        }

        let earnedXPDelta = 0;
        let earnedCoinsDelta = 0;
        let earnedGemsDelta = 0;
        let shouldEndGame = false;
        let nextIdx = idx;

        if (correct) {
          deferAchievementProgress();

          if (!isTournament) {
            if (newCombo === 5) {
              earnedXPDelta += 15;
            }

            if (newCombo === 10) {
              earnedXPDelta += 40;
            }

            earnedXPDelta += calculateBaseXP(question.difficulty, mode);
            earnedCoinsDelta += Math.floor(2 + newStreak * 0.5);
            earnedGemsDelta += newCombo === 10 ? 1 : 0;
          }
        }

        if (mode === "sudden" && correct) {
          if (nextIndex >= questions.length) {
            clearGameTimer(timerId);

            if (!isTournament) {
              earnedXPDelta += 40;
              earnedCoinsDelta += 4;
            }

            shouldEndGame = true;
          } else {
            nextIdx = nextIndex;
          }

          set((currentState) => ({
            answerHistory: nextAnswerHistory,
            streak: newStreak,
            combo: newCombo,
            score: currentState.score + 1,
            earnedXP: currentState.earnedXP + earnedXPDelta,
            earnedCoins: currentState.earnedCoins + earnedCoinsDelta,
            earnedGems: currentState.earnedGems + earnedGemsDelta,
            idx: nextIdx,
            gameOver: shouldEndGame,
            timerId: shouldEndGame ? null : currentState.timerId,
          }));

          return correct;
        }

        if (mode === "timed60" || mode === "timed90") {
          if ((timeLeft ?? 0) <= 0) {
            if (!isTournament) {
              const summary: Summary = {
                total: nextAnswerHistory.length,
                correct: nextCorrectCount,
                wrong: nextAnswerHistory.length - nextCorrectCount,
                accuracy:
                  nextAnswerHistory.length === 0
                    ? 0
                    : Math.round((nextCorrectCount / nextAnswerHistory.length) * 100),
              };

              const { bonusXP, bonusCoins } = calculateTimedBonus(mode, summary);
              earnedXPDelta += bonusXP;
              earnedCoinsDelta += bonusCoins;
            }

            set((currentState) => ({
              answerHistory: nextAnswerHistory,
              streak: newStreak,
              combo: newCombo,
              score: correct ? currentState.score + 1 : currentState.score,
              earnedXP: currentState.earnedXP + earnedXPDelta,
              earnedCoins: currentState.earnedCoins + earnedCoinsDelta,
              earnedGems: currentState.earnedGems + earnedGemsDelta,
              gameOver: true,
            }));

            return correct;
          }

          if (nextIndex >= questions.length) {
            clearGameTimer(timerId);

            if (!isTournament) {
              const summary: Summary = {
                total: nextAnswerHistory.length,
                correct: nextCorrectCount,
                wrong: nextAnswerHistory.length - nextCorrectCount,
                accuracy:
                  nextAnswerHistory.length === 0
                    ? 0
                    : Math.round((nextCorrectCount / nextAnswerHistory.length) * 100),
              };

              const { bonusXP, bonusCoins } = calculateTimedBonus(mode, summary);
              earnedXPDelta += bonusXP;
              earnedCoinsDelta += bonusCoins;
            }

            set((currentState) => ({
              answerHistory: nextAnswerHistory,
              streak: newStreak,
              combo: newCombo,
              score: correct ? currentState.score + 1 : currentState.score,
              earnedXP: currentState.earnedXP + earnedXPDelta,
              earnedCoins: currentState.earnedCoins + earnedCoinsDelta,
              earnedGems: currentState.earnedGems + earnedGemsDelta,
              gameOver: true,
              timerId: null,
            }));

            return correct;
          }

          set((currentState) => ({
            answerHistory: nextAnswerHistory,
            streak: newStreak,
            combo: newCombo,
            score: correct ? currentState.score + 1 : currentState.score,
            earnedXP: currentState.earnedXP + earnedXPDelta,
            earnedCoins: currentState.earnedCoins + earnedCoinsDelta,
            earnedGems: currentState.earnedGems + earnedGemsDelta,
            idx: nextIndex,
          }));

          return correct;
        }

        if (mode === "speed") {
          if (nextIndex >= questions.length) {
            clearGameTimer(timerId);

            if (!isTournament) {
              const summary: Summary = {
                total: nextAnswerHistory.length,
                correct: nextCorrectCount,
                wrong: nextAnswerHistory.length - nextCorrectCount,
                accuracy:
                  nextAnswerHistory.length === 0
                    ? 0
                    : Math.round((nextCorrectCount / nextAnswerHistory.length) * 100),
              };

              const { bonusXP, bonusCoins } = calculateSpeedBonus(summary);
              earnedXPDelta += bonusXP;
              earnedCoinsDelta += bonusCoins;
            }

            set((currentState) => ({
              answerHistory: nextAnswerHistory,
              streak: newStreak,
              combo: newCombo,
              score: correct ? currentState.score + 1 : currentState.score,
              earnedXP: currentState.earnedXP + earnedXPDelta,
              earnedCoins: currentState.earnedCoins + earnedCoinsDelta,
              earnedGems: currentState.earnedGems + earnedGemsDelta,
              gameOver: true,
              timerId: null,
            }));

            return correct;
          }

          set((currentState) => ({
            answerHistory: nextAnswerHistory,
            streak: newStreak,
            combo: newCombo,
            score: correct ? currentState.score + 1 : currentState.score,
            earnedXP: currentState.earnedXP + earnedXPDelta,
            earnedCoins: currentState.earnedCoins + earnedCoinsDelta,
            earnedGems: currentState.earnedGems + earnedGemsDelta,
            idx: nextIndex,
          }));

          return correct;
        }

        if ((mode === "classic" || mode === "daily") && nextIndex >= questions.length) {
          clearGameTimer(timerId);

          if (!isTournament) {
            earnedXPDelta += 30;
            earnedCoinsDelta += 3;

            if (nextCorrectCount === questions.length) {
              earnedXPDelta += 25;
              earnedCoinsDelta += 5;
              earnedGemsDelta += 1;
            }
          }

          set((currentState) => ({
            answerHistory: nextAnswerHistory,
            streak: newStreak,
            combo: newCombo,
            score: correct ? currentState.score + 1 : currentState.score,
            earnedXP: currentState.earnedXP + earnedXPDelta,
            earnedCoins: currentState.earnedCoins + earnedCoinsDelta,
            earnedGems: currentState.earnedGems + earnedGemsDelta,
            gameOver: true,
            timerId: null,
          }));

          return correct;
        }

        if (mode === "classic" || mode === "daily") {
          set((currentState) => ({
            answerHistory: nextAnswerHistory,
            streak: newStreak,
            combo: newCombo,
            score: correct ? currentState.score + 1 : currentState.score,
            earnedXP: currentState.earnedXP + earnedXPDelta,
            earnedCoins: currentState.earnedCoins + earnedCoinsDelta,
            earnedGems: currentState.earnedGems + earnedGemsDelta,
            idx: nextIndex,
          }));

          return correct;
        }

        set((currentState) => ({
          answerHistory: nextAnswerHistory,
          streak: newStreak,
          combo: newCombo,
          score: correct ? currentState.score + 1 : currentState.score,
          earnedXP: currentState.earnedXP + earnedXPDelta,
          earnedCoins: currentState.earnedCoins + earnedCoinsDelta,
          earnedGems: currentState.earnedGems + earnedGemsDelta,
        }));

        return correct;
      },

      resetGame: () => {
        clearGameTimer(get().timerId);

        const category = get().category;

        set({
          started: false,
          gameOver: false,
          gameContext: "quick",
          mode: null,
          category,
          questions: [],
          idx: 0,
          score: 0,
          streak: 0,
          combo: 0,
          timeLeft: null,
          timerId: null,
          answerHistory: [],
          earnedXP: 0,
          earnedCoins: 0,
          earnedGems: 0,
          earnedTickets: 0,
          dailyResult: null,
        });
      },
    }),
    {
      name: "quickgame-store",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      partialize: (state) => ({
        category: state.category,
        dailyResult: state.dailyResult,
      } as any),
    }
  )
);





