// src/friends/store/useFriendsStore.ts

import { create } from 'zustand';
import type { Friend, FriendRequest, FriendStatus } from '../types';

import { saveItem, StorageKeys } from '../../storage/storage';

interface FriendsState {
  friends: Friend[];
  requests: FriendRequest[];

  setRequests: (items: FriendRequest[]) => void;

  acceptRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
}

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friends: [],
  requests: [],

  setRequests: (items) => {
    set({ requests: items });
    saveItem(StorageKeys.FRIENDS, {
      friends: get().friends,
      requests: items,
    });
  },

  acceptRequest: (id) => {
    const { requests, friends } = get();
    const request = requests.find((r) => r.id === id);
    if (!request) return;

   const updatedFriends = [
  ...friends,
  { ...request.from, status: 'accepted' as FriendStatus },
];

    const updatedRequests = requests.filter((r) => r.id !== id);

    set({
      friends: updatedFriends,
      requests: updatedRequests,
    });

    saveItem(StorageKeys.FRIENDS, {
      friends: updatedFriends,
      requests: updatedRequests,
    });
  },

  rejectRequest: (id) => {
    const updatedRequests = get().requests.filter((r) => r.id !== id);

    set({ requests: updatedRequests });

    saveItem(StorageKeys.FRIENDS, {
      friends: get().friends,
      requests: updatedRequests,
    });
  },
}));

