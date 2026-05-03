import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

// ⬆️ add to existing imports

export async function updateProfile(
  uid: string,
  updates: Partial<Omit<PlayerIdentity, "uid" | "createdAt" | "updatedAt">>
): Promise<void> {
  const ref = doc(db, "players", uid);

  await updateDoc(ref, {
    ...updates,
    updatedAt: Date.now(),
  });
}

export type PlayerIdentity = {
  uid: string;
  username: string;
  displayName: string;
  avatarId: string;
  badgeId?: string | null;
  countryCode?: string | null;
  createdAt: number;
  updatedAt: number;
};

export async function getOrCreateProfile(uid: string): Promise<PlayerIdentity> {
  const ref = doc(db, "players", uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data() as PlayerIdentity;
  }

  const now = Date.now();

  const profile: PlayerIdentity = {
    uid,
    username: `player_${Math.floor(100000 + Math.random() * 900000)}`,
    displayName: "Player",
    avatarId: "default",
    badgeId: null,
    countryCode: null,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(ref, profile);

  return profile;
}

