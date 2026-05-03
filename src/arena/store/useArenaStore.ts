import { create } from "zustand";

// TYPES ---------------------------------------------

export type ArenaMode = "ranked" | "survival" | "power" | "tournament" | null;
const sampleQuestions = require("../../../assets/data/sampleQuestions.json");

export type ArenaMatchState =
  | "idle"
  | "loading"
  | "countdown"
  | "in-match"
  | "finished";

interface ArenaOpponent {
  id: string;
  name: string;
  avatar: string;
  difficulty: string;
  score: number;
  sr: number; // ⭐ ADD THIS
}


interface ArenaPlayer {
  id: string; // ⭐ ADD THIS LINE
  score: number;
  streak: number;
  powerupsUsed: number;
}


interface ArenaStoreState {
  mode: ArenaMode;
  matchState: ArenaMatchState;

  player: ArenaPlayer;
  opponent: ArenaOpponent | null;

  questions: any[];
  currentQuestionIndex: number;

  isArenaLoading: boolean;

  // POWER-UP STATES
  powerShield: boolean;
  powerFreeze: boolean;
  powerDouble: boolean;
  powerReroll: boolean;
  powerReveal: boolean;

  // SETTERS ------------------------------------------
  setMode: (mode: ArenaMode) => void;
  setMatchState: (state: ArenaMatchState) => void;
  setOpponent: (opp: ArenaOpponent) => void;

  activatePowerUp: (type: string) => void;
  deactivatePowerUp: (type: string) => void;

  // COMMON ACTIONS -----------------------------------
  loadQuestions: (qs: any[]) => void;
  nextQuestion: () => void;
  endMatch: () => void;

  updatePlayerScore: (value: number) => void;
  updateOpponentScore: (value: number) => void;

  // RANKED FLOW --------------------------------------
  startRankedMatch: () => Promise<void>;
  handlePlayerAnswer: (isCorrect: boolean) => void;
  handleAIDecision: (questionIndex: number) => void;

  // SURVIVAL FLOW ------------------------------------
  startSurvival: () => void;
  survivalCorrect: () => void;
  survivalWrong: () => void;
  setSurvivalQuestions: (qs: any[]) => void;

  // RESET ---------------------------------------------
  resetArena: () => void;
}

// STORE IMPLEMENTATION -------------------------------

export const useArenaStore = create<ArenaStoreState>((set, get) => ({
  // BASE STATE ---------------------------------------
  mode: null,
  matchState: "idle",

 player: {
  id: "player", // ⭐ ADD THIS
  score: 0,
  streak: 0,
  powerupsUsed: 0,
},


  opponent: null,

  questions: [],
  currentQuestionIndex: 0,

  isArenaLoading: false,

  // POWER-UP FLAGS -----------------------------------
  powerShield: false,
  powerFreeze: false,
  powerDouble: false,
  powerReroll: false,
  powerReveal: false,

  // SETTERS ------------------------------------------
  setMode: (mode) => set({ mode }),

  setMatchState: (state) => set({ matchState: state }),

  setOpponent: (opp) =>
  set({
    opponent: {
      id: opp.id,
      name: opp.name,
      avatar: opp.avatar,
      difficulty: opp.difficulty,
      score: 0,
      sr: opp.sr ?? 0,
    },
  }),


  activatePowerUp: (type) => {
    if (type === "freeze") set({ powerFreeze: true });
    if (type === "shield") set({ powerShield: true });
    if (type === "double") set({ powerDouble: true });
    if (type === "reroll") set({ powerReroll: true });
    if (type === "reveal") set({ powerReveal: true });
  },

  deactivatePowerUp: (type) => {
    if (type === "freeze") set({ powerFreeze: false });
    if (type === "shield") set({ powerShield: false });
    if (type === "double") set({ powerDouble: false });
    if (type === "reroll") set({ powerReroll: false });
    if (type === "reveal") set({ powerReveal: false });
  },

  // COMMON ACTIONS -----------------------------------
  loadQuestions: (qs) =>
    set({
      questions: qs,
      currentQuestionIndex: 0,
    }),

  nextQuestion: () => {
    const current = get().currentQuestionIndex;
    const total = get().questions.length;

    if (current + 1 >= total) {
      set({ matchState: "finished" });
      return;
    }

    set({ currentQuestionIndex: current + 1 });
  },

  updatePlayerScore: (value) =>
    set((state) => ({
      player: {
        ...state.player,
        score: state.player.score + value,
      },
    })),

  updateOpponentScore: (value) =>
    set((state) => ({
      opponent: state.opponent
        ? {
            ...state.opponent,
            score: state.opponent.score + value,
          }
        : null,
    })),

  endMatch: () => set({ matchState: "finished" }),

  // RANKED MODE --------------------------------------
startRankedMatch: async () => {
  const rankSystem =
    require("./useArenaRankSystem").useArenaRankSystem.getState();
  const ai =
    require("./useArenaOpponentAI").useArenaOpponentAI.getState();

  const bot = ai.generateOpponent(rankSystem.sr);
  get().setOpponent(bot);

  // LOAD QUESTIONS (CRITICAL)
  const shuffled = [...sampleQuestions].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 5);
  get().loadQuestions(selected);

  set({ matchState: "countdown" });

  await new Promise((res) => setTimeout(res, 1500));

  set({ matchState: "in-match" });
},


  handlePlayerAnswer: (isCorrect) => {
    if (isCorrect) {
      get().updatePlayerScore(1);
    }
    get().nextQuestion();
  },

  handleAIDecision: (questionIndex) => {
    const ai = require("./useArenaOpponentAI").useArenaOpponentAI.getState();
    const decision = ai.getAnswerForQuestion(questionIndex);

    if (!decision.willAnswer) return;

    setTimeout(() => {
      if (decision.correct) {
        get().updateOpponentScore(1);
      }
    }, decision.delayMs);
  },

  // SURVIVAL MODE ------------------------------------
 startSurvival: () => {
  // Reset to idle state immediately to avoid white screen
  set({ matchState: "idle" });

  // Load questions
  const shuffled = [...sampleQuestions].sort(() => Math.random() - 0.5);

  // After setting idle state, start game logic
  set({
    isArenaLoading: false,      // Clears loading state
    matchState: "in-match",     // Move directly to in-match
    questions: shuffled,
    currentQuestionIndex: 0,
    player: { id: "player", score: 0, streak: 0, powerupsUsed: 0 },

  });
},




  survivalCorrect: () => {
    const { player } = get();
    set({
      player: { ...player, score: player.score + 1, streak: player.streak + 1 },
      currentQuestionIndex: get().currentQuestionIndex + 1,
    });
  },

  survivalWrong: () => {
    set({ matchState: "finished" });
  },

  setSurvivalQuestions: (qs) =>
    set({
      questions: qs,
      currentQuestionIndex: 0,
    }),

  // RESET ---------------------------------------------
  resetArena: () =>
    set({
      mode: null,
      matchState: "idle",
      player: { id: "player", score: 0, streak: 0, powerupsUsed: 0 },
      opponent: null,
      questions: [],
      currentQuestionIndex: 0,
      powerShield: false,
      powerFreeze: false,
      powerDouble: false,
      powerReroll: false,
      powerReveal: false,
    }),
}));



