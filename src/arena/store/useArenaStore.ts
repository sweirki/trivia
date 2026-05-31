
type ArenaPayload = Record<string, unknown>;

import { create } from "zustand";
import { buildArenaQuestions } from "@/questions/gameplayQuestions";
import { ARENA_MODE_CONFIG } from "@/arena/arenaEconomyRules";

// TYPES ---------------------------------------------

export type ArenaMode = "ranked" | "survival" | "power" | "tournament" | null;

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
  title?: string;
  style?: string;
  score: number;
  sr: number; // ⭐ ADD THIS
}


interface ArenaPlayer {
  id: string; // ⭐ ADD THIS LINE
  score: number;
  streak: number;
  powerupsUsed: number;
}


type LastRankedResult = {
  playerScore: number;
  opponentScore: number;
  questionsAnswered: number;
  opponentId?: string;
  opponentName?: string;
  opponentTitle?: string;
  opponentStyle?: string;
  opponentSR?: number;
};

interface ArenaStoreState {
  mode: ArenaMode;
  matchState: ArenaMatchState;

  player: ArenaPlayer;
  opponent: ArenaOpponent | null;

  questions: ArenaPayload[];
  currentQuestionIndex: number;

  isArenaLoading: boolean;
  lastRankedResult: LastRankedResult | null;

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
  loadQuestions: (qs: ArenaPayload[]) => void;
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
  setSurvivalQuestions: (qs: ArenaPayload[]) => void;

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
  lastRankedResult: null,

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
      title: opp.title,
      style: opp.style,
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
      const state = get();
      if (state.mode === "ranked") {
        set({
          matchState: "finished",
          lastRankedResult: {
            playerScore: state.player.score,
            opponentScore: state.opponent?.score ?? 0,
            questionsAnswered: total,
            opponentId: state.opponent?.id,
            opponentName: state.opponent?.name,
            opponentTitle: state.opponent?.title,
            opponentStyle: state.opponent?.style,
            opponentSR: state.opponent?.sr,
          },
        });
      } else {
        set({ matchState: "finished" });
      }
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

  endMatch: () => {
    const state = get();
    if (state.mode === "ranked") {
      set({
        matchState: "finished",
        lastRankedResult: {
          playerScore: state.player.score,
          opponentScore: state.opponent?.score ?? 0,
          questionsAnswered: state.questions.length,
          opponentId: state.opponent?.id,
          opponentName: state.opponent?.name,
          opponentTitle: state.opponent?.title,
          opponentStyle: state.opponent?.style,
          opponentSR: state.opponent?.sr,
        },
      });
      return;
    }

    set({ matchState: "finished" });
  },

  // RANKED MODE --------------------------------------
startRankedMatch: async () => {
  const rankSystem =
    require("./useArenaRankSystem").useArenaRankSystem.getState();
  const ai =
    require("./useArenaOpponentAI").useArenaOpponentAI.getState();

  // Always reset first. Without this, a previous/half-started ranked run can
  // leave the match screen with matchState !== "idle" and zero questions.
  set({
    mode: "ranked",
    matchState: "loading",
    questions: [],
    currentQuestionIndex: 0,
    player: { id: "player", score: 0, streak: 0, powerupsUsed: 0 },
    opponent: null,
    lastRankedResult: null,
  });

  const bot = ai.generateOpponent(rankSystem.sr);
  get().setOpponent(bot);

  let rankedQuestions = buildArenaQuestions(
    "ranked",
    ARENA_MODE_CONFIG.ranked.questions ?? 7
  );

  // Production safety net: never enter ranked with the old hardcoded five
  // placeholder questions. If this ever logs, the real question registry/packs
  // are not loading and should be fixed instead of silently showing repeats.
  if (!rankedQuestions.length) {
    console.warn("[arena] Ranked question pool is empty. Check questionRegistry packs and question guards.");
    set({ matchState: "idle", isArenaLoading: false });
    return;
  }

  get().loadQuestions(rankedQuestions);

  set({ matchState: "countdown" });

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

    // Resolve the bot score immediately before the match advances.
    // The old delayed setTimeout often fired after nextQuestion()/finished,
    // so bots looked like they answered but their score stayed at 0.
    if (decision.willAnswer && decision.correct) {
      get().updateOpponentScore(1);
    }
  },

  // SURVIVAL MODE ------------------------------------
 startSurvival: () => {
  const questions = buildArenaQuestions("survival", 25);

  if (!questions.length) {
    console.warn("[arena] Survival question pool is empty. Check questionRegistry packs and question guards.");
    set({
      mode: "survival",
      matchState: "idle",
      isArenaLoading: false,
      questions: [],
      currentQuestionIndex: 0,
      player: { id: "player", score: 0, streak: 0, powerupsUsed: 0 },
    });
    return;
  }

  set({
    mode: "survival",
    isArenaLoading: false,
    matchState: "in-match",
    questions,
    currentQuestionIndex: 0,
    player: { id: "player", score: 0, streak: 0, powerupsUsed: 0 },
  });
},




  survivalCorrect: () => {
    const { player, currentQuestionIndex, questions } = get();
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex >= questions.length) {
      set({
        player: { ...player, score: player.score + 1, streak: player.streak + 1 },
        matchState: "finished",
      });
      return;
    }

    set({
      player: { ...player, score: player.score + 1, streak: player.streak + 1 },
      currentQuestionIndex: nextIndex,
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
      lastRankedResult: null,
    }),
}));






