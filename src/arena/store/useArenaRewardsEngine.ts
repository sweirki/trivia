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
type ArenaRewardDelta = {
  coins: number;
  arenaTokens: number;
};

type ArenaRewardsEngine = {
  previewRanked: (data: RankedResultPayload) => ArenaRewardDelta;
  previewSurvival: (data: SurvivalResultPayload) => ArenaRewardDelta;
  previewPower: (data: PowerResultPayload) => ArenaRewardDelta;
  rewardRanked: (data: RankedResultPayload) => ArenaRewardDelta;
  rewardSurvival: (data: SurvivalResultPayload) => ArenaRewardDelta;
  rewardPower: (data: PowerResultPayload) => ArenaRewardDelta;
};

const applyReward = (reward: ArenaRewardDelta) => {
  const { earnCoins, earnArenaTokens } = useArenaEconomyStore.getState();

  if (reward.coins > 0) earnCoins(reward.coins);
  if (reward.arenaTokens > 0) earnArenaTokens(reward.arenaTokens);

  return reward;
};

const rankedReward = ({ didWin }: RankedResultPayload): ArenaRewardDelta => ({
  // Ranked is a paid risk mode: winner gets a clean 2x-style payout.
  // Loser receives no coins, preventing "farm while losing" behavior.
  coins: didWin ? 200 : 0,
  arenaTokens: didWin ? 2 : 0,
});

const survivalReward = ({ rounds }: SurvivalResultPayload): ArenaRewardDelta => {
  if (rounds <= 0) return { coins: 0, arenaTokens: 0 };

  const coins = Math.min(300, rounds * 12);
  const arenaTokens = rounds >= 20 ? 4 : rounds >= 10 ? 2 : 0;

  return { coins, arenaTokens };
};

const powerReward = ({ score, powerUpsUsed }: PowerResultPayload): ArenaRewardDelta => {
  const didStrongRun = score >= 12;
  const didEfficientRun = score >= 18 && powerUpsUsed <= 3;

  return {
    coins: Math.max(0, score * 10),
    arenaTokens: didEfficientRun ? 3 : didStrongRun ? 1 : 0,
  };
};

export const useArenaRewardsEngine = create<ArenaRewardsEngine>(() => ({
  previewRanked: rankedReward,
  previewSurvival: survivalReward,
  previewPower: powerReward,

  rewardRanked: (data) => applyReward(rankedReward(data)),
  rewardSurvival: (data) => applyReward(survivalReward(data)),
  rewardPower: (data) => applyReward(powerReward(data)),
}));
