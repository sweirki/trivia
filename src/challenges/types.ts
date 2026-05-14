export type ChallengeStatus =
  | 'incoming'
  | 'active'
  | 'completed'
  | 'declined'
  | 'expired';

export type ChallengeResult = 'win' | 'loss' | 'draw' | 'waiting';

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
  expiresAt?: number;

  status: ChallengeStatus;

  myScore?: number;
  opponentScore?: number;
  result?: ChallengeResult;
  winner?: string;

  /** Phase 11 — Daily Challenge */
  type?: 'daily';
  dayKey?: string;
  rewardClaimed?: boolean;
}

