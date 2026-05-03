// src/friends/types.ts

export type FriendStatus =
  | 'pending'
  | 'accepted'
  | 'blocked';

export interface Friend {
  id: string;
  username: string;
  status: FriendStatus;
}

export interface FriendRequest {
  id: string;
  from: Friend;
  createdAt: number;
}

