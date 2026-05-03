export type ChallengeStatus =
  | 'incoming'
  | 'active'
  | 'completed'
  | 'declined';

export interface ChallengePlayer {
  id: string;
  username: string;
}

export interface Challenge {
  id: string;

  from: ChallengePlayer;
  to: ChallengePlayer;

  category: string;
  createdAt: number;

  status: ChallengeStatus;

  myScore?: number;
  opponentScore?: number;

  /** Phase 11 — Daily Challenge */
  type?: 'daily';
  dayKey?: string;
  rewardClaimed?: boolean;
}


