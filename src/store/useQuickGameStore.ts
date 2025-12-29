// /store/useQuickGameStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { usePlayerStore } from "./usePlayerStore";
import { useAchievementsStore } from "./achievementsStore";
import { useRankedArenaStore } from "@/arena/ranked/useRankedArenaStore";
import { useSurvivalArenaStore } from "@/arena/survival/useSurvivalArenaStore";

import { CATEGORIES } from "../data/categories";
const sampleQuestions = require("@assets/data/sampleQuestions.json");

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
  handleAnswer: (choice: string) => void;
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

        // 1) filter by category
        const filtered = sampleQuestions.filter((q) => q.category === category);

        // 2) difficulty shaping (only when NOT speed)
        let final = filtered;
        if (mode !== "speed") {
          const diff = get().getDifficultyLevel();
          final = filtered.filter((q) => {
            if (diff === "easy") return q.difficulty !== "hard";
            if (diff === "medium") return q.difficulty !== "easy";
            return true;
          });
        }

        // 3) fallback if shaping removed all questions
        if (!final.length) final = filtered;

        // 4) LAST resort fallback (should never happen if your dataset is correct)
        if (!final.length) final = sampleQuestions;

        // 5) shuffle ONCE (critical)
        final = shuffle(final);

        // 6) apply per-mode limits (classic/speed fixed counts; others can be larger)
        let limit = final;
        if (mode === "classic") limit = final.slice(0, 10);
        if (mode === "speed") limit = final.slice(0, 15);

        // 7) commit state
        set({
          started: true,
          gameOver: false,
          mode,
          category,
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
        // kill any existing timer first (same safety approach)
        const prevTimer = get().timerId;
        if (prevTimer) clearInterval(prevTimer);

        // IMPORTANT: Tournament should not be blocked by premium gating.
        // Tournament availability is controlled at tournament layer, not here.

        const filtered = sampleQuestions.filter((q) => q.category === category);
        let final = filtered;
        if (!final.length) final = sampleQuestions;

        final = shuffle(final);
        const limit = final.slice(0, questionsCount);

        set({
          started: true,
          gameOver: false,
          gameContext: "tournament",

          // reuse existing mode safely (no new mode added)
          mode: "classic",
          category,

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
      // ANSWER HANDLING ENGINE
      // ---------------------------------------------------------
      handleAnswer: (choice) => {
        const { mode, idx, questions, streak, combo, category } = get();
        const q = questions[idx];
        if (!q) return;

        const correct = q.correct === choice;
        const survivalRun =
  useSurvivalArenaStore.getState().currentRun;

if (!correct && survivalRun) {
  const { endRun } =
    useSurvivalArenaStore.getState();
  endRun();

  const t = get().timerId;
  if (t) clearInterval(t);

  set({ gameOver: true, timerId: null });
  return;
}

        const achievements = useAchievementsStore.getState();
        const player = usePlayerStore.getState();
        const isTournament = get().gameContext === "tournament";

        // Record history (FIXED SYNTAX)
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

        // Sudden death
        if (!correct && mode === "sudden") {
          const t = get().timerId;
          if (t) clearInterval(t);
          set({ gameOver: true, timerId: null });
          return;
        }

        // Correct answer reward logic
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
            if (newCombo === 5) player.applyReward(15, 0, 0);
            if (newCombo === 10) player.applyReward(40, 0, 0);
          }

          let baseXP = 10;
          if (q.difficulty === "medium") baseXP += 5;
          if (q.difficulty === "hard") baseXP += 10;
          if (mode === "speed") baseXP *= 1.1;
          if (mode === "timed60") baseXP *= 1.2;
          if (mode === "timed90") baseXP *= 1.3;
          if (mode === "sudden") baseXP *= 1.5;

          const coins = Math.floor(correct ? 2 + newStreak * 0.5 : 0);
          const gems = newCombo === 10 ? 1 : 0;

          if (!isTournament) {
            player.applyReward(Math.floor(baseXP), coins, gems);
          }

        } else {
          set({ streak: 0, combo: 0 });
        }

        // NEXT QUESTION
        const next = idx + 1;

        if (get().gameOver) return;

        // Timed infinite question loop
        if (mode === "timed60" || mode === "timed90") {
          if ((get().timeLeft ?? 0) <= 0) {
            set({ gameOver: true });
            return;
          }

          let loopIndex = idx + 1;
          if (loopIndex >= questions.length) loopIndex = 0;
          return set({ idx: loopIndex });
        }

        // Speed mode end
        if (mode === "speed") {
          if (next >= questions.length) {
            const t = get().timerId;
            if (t) clearInterval(t);

                if (!isTournament) player.applyReward(30, 3, 0); // XP + coins

            return set({ gameOver: true, timerId: null });
          }

          return set({ idx: next });
        }

        // Classic mode end
        if (mode === "classic" && next >= questions.length) {
          const t = get().timerId;
          if (t) clearInterval(t);

          const summary = get().getSummary();

                  if (!isTournament) {
            if (summary.accuracy >= 80)
              achievements.addProgress("accuracy", summary.accuracy);

            if (summary.correct === questions.length) {
              player.applyReward(50, 5, 1);
              achievements.addProgress("perfect", summary.correct);
            }

            player.applyReward(20, 3, 0);
          }


          return set({ gameOver: true, timerId: null });
        }

        set({ idx: next });
      },

      // ---------------------------------------------------------
      // RESET GAME (CLEAN)
      // ---------------------------------------------------------
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