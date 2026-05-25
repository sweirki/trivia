import { create } from "zustand";

export type OpponentDifficulty =
  | "BronzeAI"
  | "SilverAI"
  | "GoldAI"
  | "PlatinumAI"
  | "DiamondAI"
  | "MasterAI"
  | "GrandmasterAI"
  | "LegendaryAI";

export interface OpponentProfile {
  id: string;
  name: string;
  avatar: string; // you can map this later to your avatar system
  difficulty: OpponentDifficulty;
  title: string;
  style: string;
  sr: number;
  accuracy: number; // 0–1 (e.g. 0.78 = 78% correct answers)
  minReactionMs: number;
  maxReactionMs: number;
  randomness: number; // 0–1 (higher = more swingy/chaotic)
}

export interface OpponentAnswerPlan {
  questionIndex: number;
  willAnswer: boolean;
  correct: boolean;
  delayMs: number;
}

interface OpponentAIState {
  opponent: OpponentProfile | null;
  isActive: boolean;

  // Generate a new opponent profile based on player SR
  generateOpponent: (playerSR: number) => OpponentProfile;

  // Pre-plan behavior for N questions (optional, you can also query per question)
  planAnswersForQuestions: (numQuestions: number) => OpponentAnswerPlan[];

  // Get AI decision for a particular question
  getAnswerForQuestion: (questionIndex: number) => OpponentAnswerPlan;

  resetOpponent: () => void;
}

// ------------------------
// Helper utilities
// ------------------------

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomInRange(min, max + 1));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateBotName(): string {
  const prefixes = ["Quiz", "Brain", "Mind", "Trivia", "Fact", "Logic", "Omega", "Neo", "Sharp", "Nova"];
  const suffixes = ["Bot", "Master", "Wizard", "Hunter", "Champ", "Guru", "Storm", "Ghost", "Ace", "Strike"];

  return `${pickRandom(prefixes)}${pickRandom(suffixes)}`;
}


function getBotIdentity(difficulty: OpponentDifficulty): { title: string; style: string } {
  switch (difficulty) {
    case "BronzeAI":
      return { title: "Rising Rival", style: "Swingy but beatable" };
    case "SilverAI":
      return { title: "Steady Climber", style: "Balanced pressure" };
    case "GoldAI":
      return { title: "Gold Gatekeeper", style: "Punishes sloppy streaks" };
    case "PlatinumAI":
      return { title: "Precision Rival", style: "Consistent under pressure" };
    case "DiamondAI":
      return { title: "Diamond Threat", style: "Fast and accurate" };
    case "MasterAI":
      return { title: "Master Duelist", style: "Rarely gives free rounds" };
    case "GrandmasterAI":
      return { title: "Grandmaster Mind", style: "Elite pacing" };
    case "LegendaryAI":
      return { title: "Legendary Rival", style: "Near-perfect pressure" };
  }
}

// Map SR to a difficulty profile
function mapSRToDifficulty(playerSR: number): OpponentProfile {
  let difficulty: OpponentDifficulty;
  let accuracy: number;
  let minReactionMs: number;
  let maxReactionMs: number;
  let randomness: number;

  if (playerSR < 400) {
    difficulty = "BronzeAI";
    accuracy = randomInRange(0.45, 0.60);
    minReactionMs = 900;
    maxReactionMs = 1700;
    randomness = 0.4;
  } else if (playerSR < 800) {
    difficulty = "SilverAI";
    accuracy = randomInRange(0.55, 0.70);
    minReactionMs = 850;
    maxReactionMs = 1600;
    randomness = 0.35;
  } else if (playerSR < 1200) {
    difficulty = "GoldAI";
    accuracy = randomInRange(0.65, 0.80);
    minReactionMs = 800;
    maxReactionMs = 1500;
    randomness = 0.3;
  } else if (playerSR < 1600) {
    difficulty = "PlatinumAI";
    accuracy = randomInRange(0.75, 0.88);
    minReactionMs = 750;
    maxReactionMs = 1400;
    randomness = 0.28;
  } else if (playerSR < 2000) {
    difficulty = "DiamondAI";
    accuracy = randomInRange(0.82, 0.92);
    minReactionMs = 700;
    maxReactionMs = 1300;
    randomness = 0.25;
  } else if (playerSR < 2400) {
    difficulty = "MasterAI";
    accuracy = randomInRange(0.88, 0.95);
    minReactionMs = 650;
    maxReactionMs = 1200;
    randomness = 0.22;
  } else if (playerSR < 2700) {
    difficulty = "GrandmasterAI";
    accuracy = randomInRange(0.92, 0.97);
    minReactionMs = 620;
    maxReactionMs = 1100;
    randomness = 0.20;
  } else {
    difficulty = "LegendaryAI";
    accuracy = randomInRange(0.95, 0.99);
    minReactionMs = 600;
    maxReactionMs = 1000;
    randomness = 0.18;
  }

  const srJitter = randomInt(-60, 60); // make opponent SR not exactly equal to player SR
  const identity = getBotIdentity(difficulty);

  return {
    id: `bot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: generateBotName(),
    avatar: "default-bot", // hook this into your avatar system later
    difficulty,
    title: identity.title,
    style: identity.style,
    sr: Math.max(0, playerSR + srJitter),
    accuracy,
    minReactionMs,
    maxReactionMs,
    randomness,
  };
}

// ------------------------
// Store implementation
// ------------------------

export const useArenaOpponentAI = create<OpponentAIState>((set, get) => ({
  opponent: null,
  isActive: false,

  generateOpponent: (playerSR: number) => {
    const profile = mapSRToDifficulty(playerSR);
    set({
      opponent: profile,
      isActive: true,
    });
    return profile;
  },

  planAnswersForQuestions: (numQuestions: number) => {
    const { opponent } = get();
    if (!opponent) {
      throw new Error("No opponent generated. Call generateOpponent(playerSR) first.");
    }

    const plans: OpponentAnswerPlan[] = [];

    for (let i = 0; i < numQuestions; i++) {
      // Small curve: get slightly tougher as match goes on
      const fatigueFactor = 1 - i / (numQuestions * 2); // reduces accuracy a bit later
      const effectiveAccuracy = Math.max(
        0,
        Math.min(1, opponent.accuracy * fatigueFactor + randomInRange(-opponent.randomness * 0.1, opponent.randomness * 0.1))
      );

      const willAnswer = Math.random() < 0.98; // 2% chance they "timeout"
      const correct = willAnswer && Math.random() < effectiveAccuracy;
      const delayMs = randomInt(opponent.minReactionMs, opponent.maxReactionMs);

      plans.push({
        questionIndex: i,
        willAnswer,
        correct,
        delayMs,
      });
    }

    return plans;
  },

  getAnswerForQuestion: (questionIndex: number) => {
    const { opponent } = get();
    if (!opponent) {
      throw new Error("No opponent generated. Call generateOpponent(playerSR) first.");
    }

    // Could be used if you don't pre-plan all questions
    const variance = opponent.randomness;

    const effectiveAccuracy = Math.max(
      0,
      Math.min(
        1,
        opponent.accuracy + randomInRange(-variance * 0.15, variance * 0.15)
      )
    );

    const willAnswer = Math.random() < 0.98;
    const correct = willAnswer && Math.random() < effectiveAccuracy;
    const delayMs = randomInt(opponent.minReactionMs, opponent.maxReactionMs);

    return {
      questionIndex,
      willAnswer,
      correct,
      delayMs,
    };
  },

  resetOpponent: () => {
    set({
      opponent: null,
      isActive: false,
    });
  },
}));






