import {
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";

function makeQuestionSetId(uidA: string, uidB: string): string {
  // deterministic seed so both players get the same questions
  return [uidA, uidB].sort().join("_");
}

export async function sendChallenge(
  challengerUid: string,
  opponentUid: string
): Promise<void> {
  if (challengerUid === opponentUid) {
    throw new Error("Cannot challenge yourself");
  }

  const now = Date.now();
  const expiresAt = now + 24 * 60 * 60 * 1000; // 24h

  // 1) Ensure no active challenge already exists
  const challengesRef = collection(db, "challenges");
  const activeQuery = query(
    challengesRef,
    where("status", "in", ["pending", "accepted"]),
    where("challengerUid", "in", [challengerUid, opponentUid]),
    where("opponentUid", "in", [challengerUid, opponentUid])
  );

  const existing = await getDocs(activeQuery);
  if (!existing.empty) {
    throw new Error("Active challenge already exists");
  }

  // 2) Create new challenge
  const ref = doc(challengesRef);

  await setDoc(ref, {
    challengerUid,
    opponentUid,
    status: "pending",
    questionSetId: makeQuestionSetId(challengerUid, opponentUid),
    timeLimitSec: 60,
    createdAt: now,
    expiresAt,
  });
}

