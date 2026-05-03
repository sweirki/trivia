import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

function getFriendshipId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join("_");
}

export async function declineFriendRequest(
  myUid: string,
  otherUid: string
): Promise<void> {
  const friendshipId = getFriendshipId(myUid, otherUid);
  const ref = doc(db, "friendships", friendshipId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("Friendship does not exist");
  }

  const data = snap.data();

  if (data.status !== "pending") {
    throw new Error("Friendship is not pending");
  }

  if (data.requestedBy === myUid) {
    throw new Error("Cannot decline your own friend request");
  }

  await deleteDoc(ref);
}

