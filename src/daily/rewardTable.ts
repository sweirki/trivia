import { getDailyLoginReward } from "@/economy/economyRules";

export function getDailyReward(streak: number) {
  return getDailyLoginReward(streak);
}



