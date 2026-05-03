import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export async function acceptChallenge(
  challengeId: string,
  myUid: string
): Promise<void> {
  const ref = doc(db, "challenges", challengeId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("Challenge does not exist");
  }

  const data = snap.data();

  if (data.status !== "pending") {
    throw new Error("Challenge is not pending");
  }

  if (data.opponentUid !== myUid) {
    throw new Error("Only opponent can accept challenge");
  }

  if (Date.now() > data.expiresAt) {
    throw new Error("Challenge has expired");
  }

  await updateDoc(ref, {
    status: "accepted",
    acceptedAt: Date.now(),
  });
}

