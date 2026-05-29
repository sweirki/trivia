import { create } from "zustand";

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

type PowerArenaMatchState = {
  questions: Question[];
  currentIndex: number;
  score: number;
  eliminatedIndexes: number[];

  timeLeft: number;
  isRunning: boolean;

  freezeActive: boolean;
  shieldActive: boolean;
  doubleScoreActive: boolean;

  matchEnded: boolean;
};

type PowerArenaMatchActions = {
  startMatch: (questions: Question[]) => void;
  answerQuestion: (isCorrect: boolean) => void;
  nextQuestion: () => void;

  activateFreeze: () => void;
  activateShield: () => void;
  activateDoubleScore: () => void;
  rerollQuestion: () => void;
  revealTwoWrong: () => void;
  tick: () => void;
  endMatch: () => void;
  resetMatch: () => void;
};

const INITIAL_TIME = 10;

export const usePowerArenaMatchStore = create<
  PowerArenaMatchState & PowerArenaMatchActions
>((set, get) => ({
  questions: [],
  currentIndex: 0,
  score: 0,

  timeLeft: INITIAL_TIME,
  isRunning: false,

  freezeActive: false,
  shieldActive: false,
  doubleScoreActive: false,
  eliminatedIndexes: [],

  matchEnded: false,

  startMatch: (questions) => {
    set({
      questions,
      currentIndex: 0,
      score: 0,
      timeLeft: INITIAL_TIME,
      isRunning: true,
      freezeActive: false,
      shieldActive: false,
      doubleScoreActive: false,
      matchEnded: false,
    });
  },

  answerQuestion: (isCorrect) => {
    const { doubleScoreActive, shieldActive, score } = get();

    if (isCorrect) {
      set({
        score: score + (doubleScoreActive ? 2 : 1),
        doubleScoreActive: false,
      });
    } else if (shieldActive) {
      // Shield protects the miss, but the question must still resolve.
      // Leaving the same question active allowed repeated attempts and fake scoring.
      set({ shieldActive: false });
      get().nextQuestion();
      return;
    }

    get().nextQuestion();
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();

    if (currentIndex + 1 >= questions.length) {
      get().endMatch();
      return;
    }

       set({
      currentIndex: currentIndex + 1,
      timeLeft: INITIAL_TIME,
      freezeActive: false,
      eliminatedIndexes: [],
    });

  },

   activateFreeze: () => set({ freezeActive: true }),
  activateShield: () => set({ shieldActive: true }),
  activateDoubleScore: () => set({ doubleScoreActive: true }),

  // REROLL: replace current question with a different one from the same match list (pro-safe, no extra pool needed)
  rerollQuestion: () => {
    const { questions, currentIndex } = get();
    if (questions.length <= 1) return;

    // pick a different index than current
    let j = currentIndex;
    let tries = 0;
    while (j === currentIndex && tries < 10) {
      j = Math.floor(Math.random() * questions.length);
      tries++;
    }
    if (j === currentIndex) return;

    const updated = [...questions];
    updated[currentIndex] = updated[j]; // swap in a different question
    // keep the rest unchanged (simple and stable)
    set({
      questions: updated,
      timeLeft: INITIAL_TIME,
      freezeActive: false,
      eliminatedIndexes: [],
    });
  },

  // REVEAL (50/50): eliminate 2 wrong answers for the current question
  revealTwoWrong: () => {
    const { questions, currentIndex } = get();
    const q = questions[currentIndex];
    if (!q) return;

    const wrong = q.options
      .map((opt, idx) => ({ opt, idx }))
      .filter((x) => x.opt !== q.correctAnswer)
      .map((x) => x.idx);

    // shuffle wrong indexes and take 2
    wrong.sort(() => Math.random() - 0.5);

    set({
      eliminatedIndexes: wrong.slice(0, 2),
    });
  },

  tick: () => {
    const { timeLeft, freezeActive, isRunning } = get();
    if (!isRunning || freezeActive) return;

    if (timeLeft <= 1) {
      get().nextQuestion();
      return;
    }

    set({ timeLeft: timeLeft - 1 });
  },

  endMatch: () => set({ isRunning: false, matchEnded: true }),

  resetMatch: () =>
    set({
      questions: [],
      currentIndex: 0,
      score: 0,
      timeLeft: INITIAL_TIME,
      isRunning: false,
      freezeActive: false,
      shieldActive: false,
         doubleScoreActive: false,
      eliminatedIndexes: [],
      matchEnded: false,

    }),
}));




