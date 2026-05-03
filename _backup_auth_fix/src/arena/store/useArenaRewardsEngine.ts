import { create } from "zustand";
import { useArenaEconomyStore } from "./useArenaEconomyStore";

// --------------------------------------------------
// TYPES
// --------------------------------------------------
type RankedResultPayload = {
  didWin: boolean;
  playerScore: number;
};

type SurvivalResultPayload = {
  rounds: number;
};

type PowerResultPayload = {
  score: number;
  powerUpsUsed: number;
};

// --------------------------------------------------
// REWARD ENGINE
// --------------------------------------------------
type ArenaRewardsEngine = {
  rewardRanked: (data: RankedResultPayload) => void;
  rewardSurvival: (data: SurvivalResultPayload) => void;
  rewardPower: (data: PowerResultPayload) => void;
};

export const useArenaRewardsEngine = create<ArenaRewardsEngine>(() => ({
  // --------------------------------
  // RANKED
  // --------------------------------
  rewardRanked: ({ didWin, playerScore }) => {
    const { earnCoins, earnArenaTokens } =
      useArenaEconomyStore.getState();

    // Coins: always earned
    const coins = 20 + playerScore * 5;
    earnCoins(coins);

    // Tokens: wins only
    if (didWin) {
      earnArenaTokens(3);
    }
  },

  // --------------------------------
  // SURVIVAL
  // --------------------------------
  rewardSurvival: ({ rounds }) => {
    const { earnCoins, earnArenaTokens } =
      useArenaEconomyStore.getState();

    // Coins scale with endurance
    const coins = Math.min(150, rounds * 6);
    earnCoins(coins);

    // Tokens for strong runs only
    if (rounds >= 10) {
      earnArenaTokens(2);
    }
    if (rounds >= 20) {
      earnArenaTokens(2); // bonus
    }
  },

  // --------------------------------
  // POWER-UP ARENA
  // --------------------------------
  rewardPower: ({ score, powerUpsUsed }) => {
    const { earnCoins, earnArenaTokens } =
      useArenaEconomyStore.getState();

    // Coins scale with score
    earnCoins(score * 8);

    // Tokens reward efficiency
    if (score >= 4 && powerUpsUsed <= 3) {
      earnArenaTokens(2);
    }
    if (score === 6 && powerUpsUsed <= 2) {
      earnArenaTokens(2); // perfect play bonus
    }
  },
}));
