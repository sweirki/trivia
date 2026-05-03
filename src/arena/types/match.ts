export interface TournamentMatch {
  id: string;

  playerAUid: string;
  playerBUid: string;

  scoreA: number;
  scoreB: number;

  winnerUid: string | null;

  completed: boolean;

  // Added for shop-ready authority
  resolvedAt?: number;
  resolutionReason?: "normal" | "timeout" | "forfeit";
}

