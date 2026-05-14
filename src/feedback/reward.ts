import { feedback } from "./feedback";

type RewardFeedbackInput = {
  xp?: number;
  coins?: number;
  gems?: number;
  tickets?: number;
  levelUp?: boolean;
  promotion?: boolean;
};

export function playRewardFeedback(input: RewardFeedbackInput = {}) {
  if (input.promotion) {
    feedback.promotion();
    return;
  }

  if (input.levelUp) {
    feedback.levelUp();
    return;
  }

  const hasReward = Boolean(input.xp || input.coins || input.gems || input.tickets);
  if (hasReward) feedback.reward();
}

