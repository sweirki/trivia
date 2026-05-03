import {
  collection,
  getDocs,
  query,
  where,
  documentId,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { PlayerIdentity } from "../profile/getOrCreateProfile";

export type FriendsLeaderboardEntry = PlayerIdentity & {
  rankValue: number; // reuse existing metric (XP, score, etc.)
};

export async function getFriendsLeaderboard(
  myUid: string
): Promise<FriendsLeaderboardEntry[]> {
  // 1) Get accepted friendships
  const friendshipsRef = collection(db, "friendships");
  const friendshipsQuery = query(
    friendshipsRef,
    where("status", "==", "accepted"),
    where("users", "array-contains", myUid)
  );

  const friendshipsSnap = await getDocs(friendshipsQuery);

  const friendUids = new Set<string>();
  friendUids.add(myUid);

  friendshipsSnap.forEach((doc) => {
    const users = doc.data().users as string[];
    users.forEach((uid) => friendUids.add(uid));
  });

  const uidList = Array.from(friendUids);

  if (uidList.length === 0) return [];

  // 2) Fetch player profiles
  const playersRef = collection(db, "players");
  const playersQuery = query(
    playersRef,
    where(documentId(), "in", uidList)
  );

  const playersSnap = await getDocs(playersQuery);

  // ⚠️ TEMPORARY rankValue placeholder
  // Replace with your real metric later (XP / rank / score)
  const results: FriendsLeaderboardEntry[] = playersSnap.docs.map((doc) => {
    const data = doc.data() as PlayerIdentity;
    return {
      ...data,
      rankValue: 0,
    };
  });

  return results;
}
