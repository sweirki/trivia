export interface UserAchievement {
  unlocked: boolean;
  progress?: number;
  unlockedAt?: any; // Firestore Timestamp
}

