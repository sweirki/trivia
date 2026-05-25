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
  uid: string;
  rankValue: number;
  challengeWins?: number;
  challengePlayed?: number;
};

export async function getFriendsLeaderboard(
  myUid: string
): Promise<FriendsLeaderboardEntry[]> {
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

  const playersRef = collection(db, "players");

  const playersQuery = query(
    playersRef,
    where(documentId(), "in", uidList)
  );

  const [playersSnap, completedChallengeSnap] = await Promise.all([
    getDocs(playersQuery),
    getDocs(
      query(
        collection(db, "challenge_requests"),
        where("users", "array-contains", myUid),
        where("status", "==", "completed")
      )
    ),
  ]);

  const challengeWins: Record<string, number> = {};
  const challengePlayed: Record<string, number> = {};

  completedChallengeSnap.forEach((doc) => {
    const data = doc.data() as any;
    const users = Array.isArray(data.users) ? data.users : [];

    users.forEach((uid: string) => {
      if (!uidList.includes(uid)) return;
      challengePlayed[uid] = (challengePlayed[uid] ?? 0) + 1;
    });

    const winner = data.winner;
    if (typeof winner === "string" && winner !== "draw" && uidList.includes(winner)) {
      challengeWins[winner] = (challengeWins[winner] ?? 0) + 1;
    }
  });

  const results: FriendsLeaderboardEntry[] = playersSnap.docs.map((doc) => {
    const data = doc.data() as any;
    const wins = challengeWins[doc.id] ?? 0;
    const played = challengePlayed[doc.id] ?? 0;
    const xp = typeof data.xp === "number" ? data.xp : 0;

    return {
      ...data,
      uid: doc.id,
      challengeWins: wins,
      challengePlayed: played,
      rankValue: wins * 100000 + xp,
    };
  });

  return results.sort((a, b) => b.rankValue - a.rankValue);
}



