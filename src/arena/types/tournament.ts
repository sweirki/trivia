export type TournamentStatus =
  | "waiting"
  | "in_progress"
  | "completed";

export interface TournamentConfig {
  maxPlayers: number;
  entryFeeCoins: number;
  rewardCoins: number;
  questionsPerMatch: number;
  timePerQuestion: number;
}

export interface TournamentPlayer {
  uid: string;
  username: string;
  eliminated: boolean;
  eliminatedAt?: "qualifier" | "semifinal" | "final";
}

export interface Tournament {
  id: string;
  name: string;
  createdAt: number;
  startsAt: number;
  currentStage: "qualifier" | "semifinal" | "final"; // ⭐ ADD THIS
  status: TournamentStatus;
  config: TournamentConfig;
  players: TournamentPlayer[];
  winnerUid?: string;
}






