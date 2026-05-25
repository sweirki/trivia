export type TournamentRoundKey = "qualifier" | "semifinal" | "final";

export type TournamentPrestigeReward = {
  title: string;
  badge: string;
  coins: number;
  xp: number;
  arenaTokens: number;
  summary: string;
};

const ROUND_LABEL: Record<TournamentRoundKey, string> = {
  qualifier: "Qualifier",
  semifinal: "Semifinal",
  final: "Grand Final",
};

export function getTournamentRoundPrestige(round: TournamentRoundKey, didWin: boolean, isTiebreak = false) {
  if (!didWin) {
    return {
      title: "Run Recorded",
      badge: "COMEBACK TARGET",
      detail: "Tournament history saved. Re-enter the next cup with a clearer bracket target.",
    };
  }

  if (round === "final") {
    return {
      title: isTiebreak ? "Champion by Tiebreak" : "Champion Path Complete",
      badge: isTiebreak ? "TIEBREAK CROWN" : "CROWN SECURED",
      detail: isTiebreak
        ? "The final was tied, and the official bracket tiebreak crowned the higher seed."
        : "The bracket is complete. Champion ceremony, placement rewards, and prestige history are unlocked.",
    };
  }

  return {
    title: `${ROUND_LABEL[round]} Cleared`,
    badge: isTiebreak ? "TIEBREAK ADVANCE" : "ADVANCED",
    detail: isTiebreak
      ? "A tied match was resolved by the official bracket tiebreak rule."
      : `You cleared the ${ROUND_LABEL[round].toLowerCase()} and moved one step closer to the cup crown.`,
  };
}

export function getTournamentPlacementReward(placement: number, totalPlayers: number, baseCoins = 100): TournamentPrestigeReward {
  const sizeBonus = totalPlayers >= 8 ? 1.35 : totalPlayers >= 4 ? 1.15 : 1;

  if (placement === 1) {
    return {
      title: "Champion Reward",
      badge: "CHAMPION",
      coins: Math.round(baseCoins * sizeBonus),
      xp: Math.round(140 * sizeBonus),
      arenaTokens: totalPlayers >= 8 ? 4 : 3,
      summary: "Crown secured. Champion title, tournament history, and prestige progress updated.",
    };
  }

  if (placement === 2) {
    return {
      title: "Finalist Reward",
      badge: "FINALIST",
      coins: Math.round(baseCoins * 0.55 * sizeBonus),
      xp: Math.round(90 * sizeBonus),
      arenaTokens: 2,
      summary: "Finalist finish saved. Return to the next cup and claim the crown.",
    };
  }

  if (placement === 3) {
    return {
      title: "Podium Reward",
      badge: "PODIUM",
      coins: Math.round(baseCoins * 0.35 * sizeBonus),
      xp: Math.round(65 * sizeBonus),
      arenaTokens: 1,
      summary: "Podium pressure recorded. You are close to a finals breakthrough.",
    };
  }

  return {
    title: "Participation Reward",
    badge: "RUN SAVED",
    coins: Math.round(baseCoins * 0.18),
    xp: 35,
    arenaTokens: 0,
    summary: "Tournament run saved. Build momentum for the next bracket.",
  };
}

export function getPlacementLabel(placement: number) {
  if (placement === 1) return "Champion";
  if (placement === 2) return "Finalist";
  if (placement === 3) return "Podium";
  return `Place #${placement}`;
}
