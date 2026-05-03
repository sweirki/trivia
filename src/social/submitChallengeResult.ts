import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export async function submitChallengeResult(
  challengeId: string,
  myUid: string,
  score: number,
  timeMs: number
): Promise<void> {
  const ref = doc(db, "challenges", challengeId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("Challenge does not exist");
  }

  const data = snap.data();

  if (data.status !== "accepted") {
    throw new Error("Challenge is not active");
  }

  if (Date.now() > data.expiresAt) {
    throw new Error("Challenge has expired");
  }

  const updates: any = {};

  if (myUid === data.challengerUid) {
    if (data.challengerScore != null) {
      throw new Error("Challenger already submitted");
    }
    updates.challengerScore = score;
    updates.challengerTimeMs = timeMs;
  } else if (myUid === data.opponentUid) {
    if (data.opponentScore != null) {
      throw new Error("Opponent already submitted");
    }
    updates.opponentScore = score;
    updates.opponentTimeMs = timeMs;
  } else {
    throw new Error("User is not part of this challenge");
  }

  const hasBoth =
    (updates.challengerScore != null || data.challengerScore != null) &&
    (updates.opponentScore != null || data.opponentScore != null);

  if (hasBoth) {
    const challengerScore =
      updates.challengerScore ?? data.challengerScore;
    const opponentScore =
      updates.opponentScore ?? data.opponentScore;

    const challengerTime =
      updates.challengerTimeMs ?? data.challengerTimeMs;
    const opponentTime =
      updates.opponentTimeMs ?? data.opponentTimeMs;

    let winnerUid: string | "draw";

    if (challengerScore > opponentScore) {
      winnerUid = data.challengerUid;
    } else if (opponentScore > challengerScore) {
      winnerUid = data.opponentUid;
    } else {
      if (challengerTime < opponentTime) {
        winnerUid = data.challengerUid;
      } else if (opponentTime < challengerTime) {
        winnerUid = data.opponentUid;
      } else {
        winnerUid = "draw";
      }
    }

    updates.status = "completed";
    updates.winnerUid = winnerUid;
    updates.completedAt = Date.now();
  }

  await updateDoc(ref, updates);
}

