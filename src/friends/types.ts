// src/friends/types.ts

export type FriendStatus = 'pending' | 'accepted' | 'blocked';

export interface Friend {
  id: string;
  username: string;
  status: FriendStatus;
  friendCode?: string | null;
}

export interface FriendRequest {
  id: string;
  from: Friend;
  createdAt: number;
}

export interface SentFriendRequest {
  id: string;
  to: Friend;
  createdAt: number;
}

