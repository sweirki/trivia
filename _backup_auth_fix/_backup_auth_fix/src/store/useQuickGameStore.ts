// /store/useQuickGameStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { normalizeQuestions } from "@/questions/normalizeQuestions";
import { loadCategoryQuestions } from "@/questions/loadCategoryQuestions";

import { usePlayerStore } from "./usePlayerStore";
import { useAchievementsStore } from "./achievementsStore";
import { useRankedArenaStore } from "@/arena/ranked/useRankedArenaStore";
import { useSurvivalArenaStore } from "@/arena/survival/useSurvivalArenaStore";

import { CATEGORIES } from "../data/categories";
const rawQuestions = require("@assets/data/sampleQuestions.json");
const sampleQuestions = normalizeQuestions(rawQuestions);


// ---------------------------------------------------------
// HELPERS (PURE)
// ---------------------------------------------------------
const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

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

type AnswerHistoryItem = {
  questionId: number | string;
  chosen: string;
  correct: boolean;
  difficulty: "easy" | "medium" | "hard";
  category: string;
};

type OfflineReward = { xp: number; coins: number; gems: number };
type QuickGameState = {
earnedXP: number;
earnedCoins: number;
earnedGems: number;
  dailyResult: null | {
    accuracy: number;
    passed: boolean;
    perfect: boolean;
  };

  setDailyResult: (result: {
    accuracy: number;
    passed: boolean;
    perfect: boolean;
  }) => void;

  started: boolean;
  gameOver: boolean;
  gameContext: "quick" | "tournament";
  mode: QuickMode;

  category: string | null;

  questions: any[];
  idx: number;

  score: number;
  streak: number;
  combo: number;

  timeLeft: number | null;
  timerId: any | null;

  answerHistory: AnswerHistoryItem[];

  // actions
  getSummary: () => {
    total: number;
    correct: number;
    wrong: number;
    accuracy: number;
  };

  getDifficultyLevel: () => "easy" | "medium" | "hard";

  setCategory: (id: string) => void;
  clearTimer: () => void;

  initGame: (mode: QuickMode, category: string) => void;
    initTournamentGame: (category: string, questionsCount: number) => void;
 handleAnswer: (choice: string) => boolean;

  resetGame: () => void;
};

export const useQuickGameStore = create<QuickGameState>()(
  persist<QuickGameState>(
    (set, get) => ({
      // ---------------------------------------------------------
      // GAME STATE CORE
      // ---------------------------------------------------------
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
dailyResult: null,


      // ---------------------------------------------------------
      // SUMMARY
      // ---------------------------------------------------------
      getSummary: () => {
        const h = get().answerHistory;
        const correct = h.filter((x) => x.correct).length;
        const total = h.length;
        return {
          total,
          correct,
          wrong: total - correct,
          accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
        };
      },

      // ---------------------------------------------------------
      // ADAPTIVE DIFFICULTY
      // ---------------------------------------------------------
      getDifficultyLevel: () => {
        const s = get().streak;
        if (s < 3) return "easy";
        if (s < 6) return "medium";
        return "hard";
      },

      setCategory: (id) => set({ category: id }),

      // ---------------------------------------------------------
      // INTERNAL: TIMER CLEANUP (single authority)
      // ---------------------------------------------------------
      clearTimer: () => {
        const t = get().timerId;
        if (t) clearInterval(t);
        set({ timerId: null });
      },

      // ---------------------------------------------------------
      // INIT GAME (LOCKED PIPELINE)
      // ---------------------------------------------------------
      initGame: (mode, category) => {
                // ---------------------------------------------------------
        // RANKED ARENA OVERRIDE (Phase 11.2)
        // ---------------------------------------------------------
        const rankedMatch = useRankedArenaStore.getState().currentMatch;
// ---------------------------------------------------------
// SURVIVAL ARENA OVERRIDE
// ---------------------------------------------------------
const survivalRun =
  useSurvivalArenaStore.getState().currentRun;

if (survivalRun) {
  set({
    started: true,
    gameOver: false,
    mode: "survival",
    category: "survival",
    questions: survivalRun.questions,
    idx: 0,
    score: 0,
    combo: 0,
    streak: 0,
    timeLeft: null,
    timerId: null,
    answerHistory: [],
  });

  return;
}

        if (rankedMatch) {
          set({
            started: true,
            gameOver: false,
            mode: "ranked",
            category: "ranked",
            questions: rankedMatch.questions,
            idx: 0,
            score: 0,
            combo: 0,
            streak: 0,
            timeLeft: null,
            timerId: null,
            answerHistory: [],
          });

          return;
        }

        // kill any existing timer first
        const prevTimer = get().timerId;
        if (prevTimer) clearInterval(prevTimer);

        const owned = usePlayerStore.getState().ownedPacks;

        // Gate premium packs (same as your logic)
        const meta = CATEGORIES.find((c) => c.id === category);
        const isLocked = meta?.premium && !owned.includes(meta.id);
        if (isLocked) {
          // Safety: refuse to start locked category
          // (UI should prevent this, but store must be defensive)
          set({
            started: false,
            gameOver: false,
            mode: null,
            category: null,
            questions: [],
            idx: 0,
            score: 0,
            combo: 0,
            streak: 0,
            timeLeft: null,
            timerId: null,
            answerHistory: [],
          });
          return;
        }

     let basePool: any[] = [];

try {
  basePool = loadCategoryQuestions(category);
} catch (e) {
  console.warn(
    "[QuickGame] Category load failed, falling back to sampleQuestions:",
    e
  );

  basePool = sampleQuestions.filter(
    (q) => q.category === category
  );
}

// 2) difficulty shaping (only when NOT speed)
let final = basePool;
if (mode !== "speed") {
  const diff = get().getDifficultyLevel();
  final = basePool.filter((q) => {
    if (diff === "easy") return q.difficulty !== "hard";
    if (diff === "medium") return q.difficulty !== "easy";
    return true;
  });
}

// 3) fallback if shaping removed all questions
if (!final.length) final = basePool;

// 4) LAST resort fallback (absolute safety)
if (!final.length) final = sampleQuestions;


        // 5) shuffle ONCE (critical)
        final = shuffle(final);

      // 6) apply per-mode limits (classic/speed/daily fixed counts)
let limit = final;
if (mode === "classic") limit = final.slice(0, 10);
if (mode === "speed") limit = final.slice(0, 15);
if (mode === "daily") limit = final.slice(0, 7);

        // 7) commit state
        set({
          started: true,
          gameOver: false,
          mode,
          category: category,
          questions: limit,
          idx: 0,
          score: 0,
          combo: 0,
          streak: 0,
          timeLeft: null,
          timerId: null,
          answerHistory: [],
        });

        // 8) timed modes timer start (store-owned, leak-proof)
        let duration = 0;
        if (mode === "timed60") duration = 60;
        if (mode === "timed90") duration = 90;

        if (duration > 0) {
          set({ timeLeft: duration });

          const timer = setInterval(() => {
            const { timeLeft, gameOver } = get();

            // if game ends for any reason, STOP TIMER (this fixes leaks)
            if (gameOver) {
              clearInterval(timer);
              set({ timerId: null });
              return;
            }

            const safe = typeof timeLeft === "number" ? timeLeft : 0;

            if (safe <= 1) {
              clearInterval(timer);
              set({ timeLeft: 0, gameOver: true, timerId: null });
            } else {
              set({ timeLeft: safe - 1 });
            }
          }, 1000);

          set({ timerId: timer });
        }
      },

            // ---------------------------------------------------------
      // INIT TOURNAMENT GAME (ADD-ONLY, SAFE)
      // ---------------------------------------------------------
    initTournamentGame: (category, questionsCount) => {
  const resolvedCategory =
    category ||
    CATEGORIES.find((c) => !c.premium)?.id ||
    "science";

  const prevTimer = get().timerId;
  if (prevTimer) clearInterval(prevTimer);

  let basePool: any[] = [];

  try {
    basePool = loadCategoryQuestions(resolvedCategory);
  } catch (e) {
    console.warn(
      "[Tournament] Category load failed, falling back to sampleQuestions:",
      e
    );

    basePool = sampleQuestions.filter(
  (q) => q.category === resolvedCategory
    );
  }

  if (!basePool.length) basePool = sampleQuestions;

  const final = shuffle(basePool);
  const limit = final.slice(0, questionsCount);

  set({
    started: true,
    gameOver: false,
    gameContext: "tournament",
    mode: "classic",
    category: resolvedCategory,
    questions: limit,
    idx: 0,
    score: 0,
    combo: 0,
    streak: 0,
    timeLeft: null,
    timerId: null,
    answerHistory: [],
  });

      },

    // ---------------------------------------------------------
// ANSWER HANDLING ENGINE (FINAL, CLEAN)
// ---------------------------------------------------------
handleAnswer: (choice) => {
  const { mode, idx, questions, streak, combo, category } = get();
  const q = questions[idx];
  if (!q) return false;

  const idxCorrect = Number(q.correctAnswerIndex);
  const correct = q.answers[idxCorrect] === choice;

  const survivalRun =
    useSurvivalArenaStore.getState().currentRun;

  // ---------------------------------------------------------
  // SURVIVAL: wrong answer ends run immediately
  // ---------------------------------------------------------
  if (!correct && survivalRun) {
    const { endRun } =
      useSurvivalArenaStore.getState();
    endRun();

    const t = get().timerId;
    if (t) clearInterval(t);

    set({ gameOver: true, timerId: null });
    return correct;
  }

  const achievements = useAchievementsStore.getState();
  const player = usePlayerStore.getState();
  const isTournament = get().gameContext === "tournament";

  // ---------------------------------------------------------
  // RECORD ANSWER HISTORY
  // ---------------------------------------------------------
  set((s) => ({
    answerHistory: [
      ...s.answerHistory,
      {
        questionId: q.id,
        chosen: choice,
        correct,
        difficulty: q.difficulty,
        category: q.category,
      },
    ],
  }));

  // ---------------------------------------------------------
  // SUDDEN DEATH
  // ---------------------------------------------------------
if (!correct && mode === "sudden") {
  const t = get().timerId;
  if (t) clearInterval(t);

  if (!isTournament) {
    const summary = get().getSummary();

    // Sudden Death reward philosophy:
    // low frequency, high pride
 let bonusXP = 15; // minimum for courage

if (summary.correct >= 5) bonusXP += 25;
if (summary.correct >= 10) bonusXP += 40;
if (summary.correct >= 15) bonusXP += 60;
if (summary.correct >= 20) bonusXP += 80;


   set((s) => ({
  earnedXP: s.earnedXP + bonusXP,
}));

  }

  set({ gameOver: true, timerId: null });
  return correct;
}
// Sudden Death correct answer → advance
if (mode === "sudden" && correct) {
  set({ idx: idx + 1 });
  return correct;
}


  // ---------------------------------------------------------
  // CORRECT ANSWER REWARDS
  // ---------------------------------------------------------
  if (correct) {
    if (!isTournament) {
      achievements.addProgress("combo", 1);
      achievements.addProgress("category", 1, category);
    }

    const newStreak = streak + 1;
    const newCombo = combo + 1;

    set({ streak: newStreak, combo: newCombo });
    set((st) => ({ score: st.score + 1 }));

    if (!isTournament) {
   if (newCombo === 5) {
  set((s) => ({ earnedXP: s.earnedXP + 15 }));
}
if (newCombo === 10) {
  set((s) => ({ earnedXP: s.earnedXP + 40 }));
}

    }

    let baseXP = 8;
    if (q.difficulty === "medium") baseXP += 4;
    if (q.difficulty === "hard") baseXP += 8;
   if (mode === "speed") baseXP *= 1.25;
    if (mode === "timed60") baseXP *= 1.2;
    if (mode === "timed90") baseXP *= 1.3;
    if (mode === "sudden") baseXP *= 1.5;

    const coins = Math.floor(2 + newStreak * 0.5);
    const gems = newCombo === 10 ? 1 : 0;

    if (!isTournament) {
   set((s) => ({
  earnedXP: s.earnedXP + Math.floor(baseXP),
  earnedCoins: s.earnedCoins + coins,
  earnedGems: s.earnedGems + gems,
}));


    }
  } else {
    set({ streak: 0, combo: 0 });
  }

  // ---------------------------------------------------------
  // NEXT QUESTION LOGIC
  // ---------------------------------------------------------
  const next = idx + 1;

 if (get().gameOver && mode !== "classic" && mode !== "daily") return correct;

 // Timed modes (TUNED)
if (mode === "timed60" || mode === "timed90") {
  if ((get().timeLeft ?? 0) <= 0) {
    if (!isTournament) {
      const summary = get().getSummary();

 let bonusXP = mode === "timed90" ? 30 : 20;
let bonusCoins = 0;

if (summary.correct >= 10)
  bonusXP += mode === "timed90" ? 30 : 20;

if (summary.correct >= 15)
  bonusXP += mode === "timed90" ? 45 : 30;

if (summary.correct >= 25 && mode === "timed90")
  bonusXP += 60;

if (summary.accuracy === 100)
  bonusXP += mode === "timed90" ? 25 : 20;

      // Small coin reward (timed is XP-focused)
      if (summary.correct >= 10) bonusCoins = 1;
      if (summary.correct >= 20) bonusCoins = 2;

   set((s) => ({
  earnedXP: s.earnedXP + bonusXP,
  earnedCoins: s.earnedCoins + bonusCoins,
}));

    }

    set({ gameOver: true });
    return correct;
  }

  const loopIndex =
    idx + 1 >= questions.length ? 0 : idx + 1;
  set({ idx: loopIndex });
  return correct;
}


 // Speed mode end (TUNED)
if (mode === "speed") {
  if (next >= questions.length) {
    const t = get().timerId;
    if (t) clearInterval(t);

    if (!isTournament) {
      const summary = get().getSummary();

      // Base finish bonus (always)
  let bonusXP = 15;
let bonusCoins = 1;

if (summary.accuracy >= 70) bonusXP += 20;
if (summary.accuracy === 100) {
  bonusXP += 45;
  bonusCoins += 2;
}


     set((s) => ({
  earnedXP: s.earnedXP + bonusXP,
  earnedCoins: s.earnedCoins + bonusCoins,
}));

    }

    set({ gameOver: true, timerId: null });
    return correct;
  }

  set({ idx: next });
  return correct;
}


  // Classic mode
if ((mode === "classic" || mode === "daily") && next >= questions.length) {

  const t = get().timerId;
  if (t) clearInterval(t);

  if (!isTournament) {
    // base completion reward
    set((s) => ({
      earnedXP: s.earnedXP + 30,
      earnedCoins: s.earnedCoins + 3,
    }));

    // perfect game bonus
    if (get().getSummary().correct === questions.length) {
      set((s) => ({
        earnedXP: s.earnedXP + 25,
        earnedCoins: s.earnedCoins + 5,
        earnedGems: s.earnedGems + 1,
      }));
    }
  }

  set({ gameOver: true, timerId: null });
  return correct;
}

if (mode === "classic" || mode === "daily") {
  set({ idx: next });
  return correct;
}

},

      // ---------------------------------------------------------
      // RESET GAME (CLEAN)
      // ---------------------------------------------------------
            setDailyResult: (result) =>
        set({ dailyResult: result }),

      resetGame: () => {
        const t = get().timerId;
        if (t) clearInterval(t);

        // Keep category selection (your original intent)
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

        });
      },
    }),
    {
     name: "quickgame-store",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
