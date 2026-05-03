// src/liveops/types.ts

export type LiveOpStatus =
  | 'upcoming'
  | 'live'
  | 'ended';

export type LiveOpType =
  | 'event'
  | 'daily'
  | 'weekly'
  | 'seasonal';

export interface LiveOp {
  id: string;
  title: string;
  description?: string;

  type: LiveOpType;

  startsAt: number; // unix timestamp (ms)
  endsAt: number;   // unix timestamp (ms)

  status: LiveOpStatus;
}
