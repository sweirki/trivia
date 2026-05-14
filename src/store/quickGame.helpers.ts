// src/store/quickGame.helpers.ts
import { PLAYABLE_CATEGORIES, getPlayableCategoryById } from "@/data/categories";
import { buildGlobalDailyQuestionPool } from "@/questions/dailyPools";
import {
  buildQuestionSession,
  getQuestionCountForSessionMode,
  type QuestionSessionMode,
} from "@/questions/questionSession";

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

export type Difficulty = "easy" | "medium" | "hard" | "expert";
export type GameContext = "quick" | "tournament";

export type QuickQuestion = {
  id: number | string;
  text: string;
  answers: string[];
  correctAnswerIndex: number | string;
  difficulty: Difficulty;
  category: string;
};

export type Summary = {
  total: number;
  correct: number;
  wrong: number;
  accuracy: number;
};

export const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];

  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
};

export const getFallbackPlayableCategoryId = () =>
  PLAYABLE_CATEGORIES[0]?.id ?? "science";

export const resolvePlayableCategoryId = (category: string | null | undefined) => {
  const requested = typeof category === "string" ? category : null;

  if (requested && requested !== "daily") {
    const found = getPlayableCategoryById(requested);
    if (found) return found.id;
  }

  return getFallbackPlayableCategoryId();
};

export const clearGameTimer = (timer: ReturnType<typeof setInterval> | null) => {
  if (timer) clearInterval(timer);
};

export const getQuestionPool = (
  category: string,
  logPrefix: string,
  loadCategoryQuestions: (category: string) => QuickQuestion[],
  fallbackQuestions: QuickQuestion[]
) => {
  let basePool: QuickQuestion[] = [];

  try {
    basePool = loadCategoryQuestions(category);
  } catch (error) {
    console.warn(
      `[${logPrefix}] Category load failed, falling back to provided pool:`,
      error
    );

    basePool = fallbackQuestions.filter((q) => q.category === category);
  }

  return basePool.length ? basePool : fallbackQuestions;
};

export const limitQuestionsForMode = (mode: QuickMode, questions: QuickQuestion[]) => {
  if (mode === "classic") return questions.slice(0, 10);
  if (mode === "speed") return questions.slice(0, 15);
  if (mode === "daily") return questions.slice(0, 7);

  return questions;
};


export const buildCuratedQuestionsForMode = (
  mode: QuickMode,
  category: string,
  fallbackQuestions: QuickQuestion[],
  options: {
    preferredDifficulty?: Difficulty;
    tournamentCount?: number;
    allowPremium?: boolean;
    excludeQuestionIds?: Array<string | number>;
    seed?: string | number;
  } = {}
) => {
  const sessionMode: QuestionSessionMode =
    mode === "ranked" ||
    mode === "survival" ||
    mode === "daily" ||
    mode === "speed" ||
    mode === "timed60" ||
    mode === "timed90" ||
    mode === "sudden" ||
    mode === "classic"
      ? mode
      : "classic";

  const count =
    typeof options.tournamentCount === "number"
      ? options.tournamentCount
      : getQuestionCountForSessionMode(sessionMode);

  if (count <= 0) {
    return fallbackQuestions;
  }

  try {
    const session = mode === "daily"
      ? buildGlobalDailyQuestionPool({
          count,
          allowPremium: options.allowPremium,
          excludeQuestionIds: options.excludeQuestionIds,
        })
      : buildQuestionSession({
          mode: sessionMode,
          category,
          count,
          allowPremium: options.allowPremium,
          preferredDifficulty: options.preferredDifficulty,
          excludeQuestionIds: options.excludeQuestionIds,
          seed: options.seed,
        });

    if (session.questions.length) return session.questions as QuickQuestion[];
  } catch (error) {
    console.warn("[QuickGame] Curated question session failed, using provided fallback:", error);
  }

  const excludedIds = new Set((options.excludeQuestionIds ?? []).map((id) => String(id)));
  const freshFallbackQuestions = fallbackQuestions.filter((question) => !excludedIds.has(String(question.id)));
  const fallbackPool = freshFallbackQuestions.length >= Math.min(count, fallbackQuestions.length)
    ? freshFallbackQuestions
    : fallbackQuestions;

  return limitQuestionsForMode(mode, shuffle(fallbackPool));
};


export const createFreshGameState = (
  mode: QuickMode,
  category: string,
  questions: QuickQuestion[],
  gameContext: GameContext = "quick"
) => ({
  started: true,
  gameOver: false,
  gameContext,
  mode,
  category,
  questions,
  idx: 0,
  score: 0,
  combo: 0,
  streak: 0,
  timeLeft: null,
  timerId: null,
  answerHistory: [],
  earnedXP: 0,
  earnedCoins: 0,
  earnedGems: 0,
  earnedTickets: 0,
  dailyResult: null,
});

export const calculateBaseXP = (difficulty: Difficulty, mode: QuickMode) => {
  let baseXP = 8;

  if (difficulty === "medium") baseXP += 4;
  if (difficulty === "hard") baseXP += 8;
  if (difficulty === "expert") baseXP += 12;
  if (mode === "speed") baseXP *= 1.25;
  if (mode === "timed60") baseXP *= 1.2;
  if (mode === "timed90") baseXP *= 1.3;
  if (mode === "sudden") baseXP *= 1.5;

  return Math.floor(baseXP);
};

export const calculateSuddenDeathBonusXP = (correctCount: number) => {
  let bonusXP = 15;

  if (correctCount >= 5) bonusXP += 25;
  if (correctCount >= 10) bonusXP += 40;
  if (correctCount >= 15) bonusXP += 60;
  if (correctCount >= 20) bonusXP += 80;

  return bonusXP;
};

export const calculateTimedBonus = (mode: QuickMode, summary: Summary) => {
  let bonusXP = mode === "timed90" ? 30 : 20;
  let bonusCoins = 0;

  if (summary.correct >= 10) bonusXP += mode === "timed90" ? 30 : 20;
  if (summary.correct >= 15) bonusXP += mode === "timed90" ? 45 : 30;
  if (summary.correct >= 25 && mode === "timed90") bonusXP += 60;
  if (summary.accuracy === 100) bonusXP += mode === "timed90" ? 25 : 20;

  if (summary.correct >= 10) bonusCoins = 1;
  if (summary.correct >= 20) bonusCoins = 2;

  return { bonusXP, bonusCoins };
};

export const calculateSpeedBonus = (summary: Summary) => {
  let bonusXP = 15;
  let bonusCoins = 1;

  if (summary.accuracy >= 70) bonusXP += 20;

  if (summary.accuracy === 100) {
    bonusXP += 45;
    bonusCoins += 2;
  }

  return { bonusXP, bonusCoins };
};
