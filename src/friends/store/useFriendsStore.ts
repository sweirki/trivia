// src/friends/store/useFriendsStore.ts

import { create } from "zustand";
import type { Friend, FriendRequest, SentFriendRequest } from "../types";
import { saveItem, StorageKeys } from "../../storage/storage";
import { auth, db } from "@/firebase/firebase";
import {
  collection,
  doc,
  documentId,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  getDocData,
  getFriendIdsFromFriendships,
  getPlayerDisplayName,
  mapFriend,
  mapIncomingRequest,
  mapSentRequest,
} from "./friends.mappers";

const makeFriendCode = (uid: string) => `TRV-${uid.slice(0, 6).toUpperCase()}`;
const normalizeCode = (value: string) => value.trim().toUpperCase();

function getFriendlyError(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function getCurrentUsername() {
  const user = auth.currentUser;
  return user?.displayName || user?.email?.split("@")[0] || "Player";
}

interface FriendsState {
  friends: Friend[];
  requests: FriendRequest[];
  sentRequests: SentFriendRequest[];
  myFriendCode: string | null;
  loading: boolean;
  error: string | null;

  setRequests: (items: FriendRequest[]) => void;
  ensureMyFriendCode: () => Promise<string | null>;
  loadRemote: () => Promise<void>;
  sendFriendRequestByCode: (friendCode: string) => Promise<boolean>;
  acceptRequest: (id: string) => Promise<void>;
  rejectRequest: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friends: [],
  requests: [],
  sentRequests: [],
  myFriendCode: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  setRequests: (items) => {
    set({ requests: items });
    saveItem(StorageKeys.FRIENDS, {
      friends: get().friends,
      requests: items,
    });
  },

  ensureMyFriendCode: async () => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: "Please sign in first." });
      return null;
    }

    const friendCode = makeFriendCode(user.uid);
    const username = getCurrentUsername();

    await setDoc(
      doc(db, "players", user.uid),
      {
        uid: user.uid,
        username,
        displayName: username,
        email: user.email ?? null,
        friendCode,
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    set({ myFriendCode: friendCode });
    return friendCode;
  },

  loadRemote: async () => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: "Please sign in first." });
      return;
    }

    set({ loading: true, error: null });

    try {
      const myCode = await get().ensureMyFriendCode();
      if (!myCode) {
        set({ loading: false });
        return;
      }

      const incomingQuery = query(
        collection(db, "friend_requests"),
        where("to", "==", user.uid),
        where("status", "==", "pending")
      );

      const outgoingQuery = query(
        collection(db, "friend_requests"),
        where("from", "==", user.uid),
        where("status", "==", "pending")
      );

      const friendshipsQuery = query(
        collection(db, "friendships"),
        where("users", "array-contains", user.uid),
        where("status", "==", "accepted")
      );

      const [incomingSnap, outgoingSnap, friendshipsSnap] = await Promise.all([
        getDocs(incomingQuery),
        getDocs(outgoingQuery),
        getDocs(friendshipsQuery),
      ]);

      const requests = incomingSnap.docs.map(mapIncomingRequest);
      const sentRequests = outgoingSnap.docs.map(mapSentRequest);
      const friendIds = getFriendIdsFromFriendships(
        friendshipsSnap.docs,
        user.uid
      );

      let friends: Friend[] = [];

      if (friendIds.length > 0) {
        const playersQuery = query(
          collection(db, "players"),
          where(documentId(), "in", friendIds.slice(0, 10))
        );

        const playersSnap = await getDocs(playersQuery);
        friends = playersSnap.docs.map(mapFriend);
      }

      set({ friends, requests, sentRequests, loading: false, error: null });
      saveItem(StorageKeys.FRIENDS, { friends, requests });
    } catch (error) {
      set({
        loading: false,
        error: getFriendlyError(error, "Failed to load friends."),
      });
    }
  },

  sendFriendRequestByCode: async (friendCode) => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: "Please sign in first." });
      return false;
    }

    const cleanCode = normalizeCode(friendCode);
    if (!cleanCode) {
      set({ error: "Enter a friend code." });
      return false;
    }

    set({ loading: true, error: null });

    try {
      const myCode = await get().ensureMyFriendCode();
      if (!myCode) {
        set({ loading: false });
        return false;
      }

      if (cleanCode === myCode) {
        set({ loading: false, error: "You cannot add yourself." });
        return false;
      }

      const playerQuery = query(
        collection(db, "players"),
        where("friendCode", "==", cleanCode)
      );

      const playerSnap = await getDocs(playerQuery);
      const targetDoc = playerSnap.docs[0];

      if (!targetDoc) {
        set({
          loading: false,
          error: "No player found with that friend code.",
        });
        return false;
      }

      const target = getDocData(targetDoc);
      const requestId = [user.uid, targetDoc.id].sort().join("_");
      const username = getCurrentUsername();

      await setDoc(
        doc(db, "friend_requests", requestId),
        {
          from: user.uid,
          to: targetDoc.id,
          fromUsername: username,
          fromFriendCode: myCode,
          toUsername: getPlayerDisplayName(target),
          toFriendCode: cleanCode,
          users: [user.uid, targetDoc.id],
          status: "pending",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      await get().loadRemote();
      return true;
    } catch (error) {
      set({
        loading: false,
        error: getFriendlyError(error, "Failed to send friend request."),
      });
      return false;
    }
  },

  acceptRequest: async (id) => {
    const user = auth.currentUser;
    if (!user) {
      set({ error: "Please sign in first." });
      return;
    }

    const request = get().requests.find((item) => item.id === id);
    if (!request) return;

    set({ loading: true, error: null });

    try {
      const friendshipId = [user.uid, request.from.id].sort().join("_");

      await setDoc(
        doc(db, "friendships", friendshipId),
        {
          users: [user.uid, request.from.id],
          status: "accepted",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      await updateDoc(doc(db, "friend_requests", id), {
        status: "accepted",
        updatedAt: Date.now(),
      });

      await get().loadRemote();
    } catch (error) {
      set({
        loading: false,
        error: getFriendlyError(error, "Failed to accept request."),
      });
    }
  },

  rejectRequest: async (id) => {
    set({ loading: true, error: null });

    try {
      await updateDoc(doc(db, "friend_requests", id), {
        status: "rejected",
        updatedAt: Date.now(),
      });

      await get().loadRemote();
    } catch (error) {
      set({
        loading: false,
        error: getFriendlyError(error, "Failed to reject request."),
      });
    }
  },
}));

