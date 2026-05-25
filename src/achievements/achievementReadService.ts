import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export async function getUnlockedAchievementIds(userId: string): Promise<string[]> {
  const snap = await getDocs(
collection(db, "players", userId, "achievements")

  );

  const unlocked: string[] = [];

  snap.forEach(doc => {
    const data = doc.data();
    if (data?.unlocked === true) {
      unlocked.push(doc.id);
    }
  });

  return unlocked;
}




