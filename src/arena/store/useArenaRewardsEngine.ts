import { create } from "zustand";
import { useArenaEconomyStore } from "./useArenaEconomyStore";
import {
  getPowerRewardPreview,
  getRankedRewardPreview,
  getSurvivalRewardPreview,
} from "@/arena/arenaEconomyRules";

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

const rankedReward = ({ didWin }: RankedResultPayload): ArenaRewardDelta => {
  const reward = getRankedRewardPreview(didWin);
  return { coins: reward.coins, arenaTokens: reward.arenaTokens };
};

const survivalReward = ({ rounds }: SurvivalResultPayload): ArenaRewardDelta => {
  const reward = getSurvivalRewardPreview(rounds);
  return { coins: reward.coins, arenaTokens: reward.arenaTokens };
};

const powerReward = ({ score, powerUpsUsed }: PowerResultPayload): ArenaRewardDelta => {
  const reward = getPowerRewardPreview(score, powerUpsUsed);
  return { coins: reward.coins, arenaTokens: reward.arenaTokens };
};

export const useArenaRewardsEngine = create<ArenaRewardsEngine>(() => ({
  previewRanked: rankedReward,
  previewSurvival: survivalReward,
  previewPower: powerReward,

  rewardRanked: (data) => applyReward(rankedReward(data)),
  rewardSurvival: (data) => applyReward(survivalReward(data)),
  rewardPower: (data) => applyReward(powerReward(data)),
}));


