import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";


function getFriendshipId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join("_");
}

export async function sendFriendRequest(
  fromUid: string,
  toUid: string
): Promise<void> {
  if (fromUid === toUid) {
    throw new Error("Cannot send friend request to self");
  }

  const friendshipId = getFriendshipId(fromUid, toUid);
  const ref = doc(db, "friendships", friendshipId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    throw new Error("Friendship already exists");
  }

  const now = Date.now();

  await setDoc(ref, {
    users: [fromUid, toUid].sort(),
    status: "pending",
    requestedBy: fromUid,
    createdAt: now,
    updatedAt: now,
  });
}
