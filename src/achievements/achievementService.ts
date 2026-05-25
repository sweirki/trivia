import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from "@/firebase/firebase";

import { UserAchievement } from './achievementTypes';

/**
 * Path helper
 */
const achievementRef = (userId: string, achievementId: string) =>
  doc(db, 'players', userId, 'achievements', achievementId);

/**
 * Read single achievement
 */
export async function getAchievement(
  userId: string,
  achievementId: string
): Promise<UserAchievement | null> {
  const snap = await getDoc(achievementRef(userId, achievementId));
  return snap.exists() ? (snap.data() as UserAchievement) : null;
}

/**
 * Unlock one-time achievement (safe, idempotent)
 */
export async function unlockAchievement(
  userId: string,
  achievementId: string
) {
  const ref = achievementRef(userId, achievementId);
  const snap = await getDoc(ref);

  if (snap.exists() && snap.data().unlocked === true) {
    return; // already unlocked → do nothing
  }

  await setDoc(
    ref,
    {
      unlocked: true,
      unlockedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Update progress achievement
 */
export async function updateAchievementProgress(
  userId: string,
  achievementId: string,
  progress: number,
  threshold: number
) {
  const ref = achievementRef(userId, achievementId);
  const snap = await getDoc(ref);

  if (snap.exists() && snap.data().unlocked === true) {
    return; // finished → no updates
  }

  const unlocked = progress >= threshold;

 await setDoc(
  ref,
  {
    progress,
    unlocked,
    ...(unlocked && {
      unlockedAt: serverTimestamp(),
    }),
  },
  { merge: true }
);


}




