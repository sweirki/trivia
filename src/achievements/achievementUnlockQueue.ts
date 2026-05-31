import { create } from "zustand";
import { ACHIEVEMENTS, AchievementDefinition } from "./achievementDefinitions";

export type AchievementUnlockMoment = AchievementDefinition & {
  queuedAt: number;
};

type AchievementUnlockQueueState = {
  queue: AchievementUnlockMoment[];
  recentlyQueuedIds: Record<string, number>;
  enqueueAchievement: (achievementId: string) => void;
  dismissCurrentAchievement: () => void;
  clearAchievementQueue: () => void;
};

const RECENT_DUPLICATE_WINDOW_MS = 3_000;

function getAchievementDefinition(achievementId: string) {
  return ACHIEVEMENTS.find((achievement) => achievement.id === achievementId) ?? null;
}

export const useAchievementUnlockQueue = create<AchievementUnlockQueueState>((set, get) => ({
  queue: [],
  recentlyQueuedIds: {},

  enqueueAchievement: (achievementId) => {
    const achievement = getAchievementDefinition(achievementId);
    if (!achievement) return;

    const now = Date.now();
    const lastQueuedAt = get().recentlyQueuedIds[achievementId] ?? 0;

    if (now - lastQueuedAt < RECENT_DUPLICATE_WINDOW_MS) return;

    set((state) => ({
      queue: [...state.queue, { ...achievement, queuedAt: now }],
      recentlyQueuedIds: {
        ...state.recentlyQueuedIds,
        [achievementId]: now,
      },
    }));
  },

  dismissCurrentAchievement: () => {
    set((state) => ({ queue: state.queue.slice(1) }));
  },

  clearAchievementQueue: () => set({ queue: [] }),
}));

export function queueAchievementUnlock(achievementId: string) {
  useAchievementUnlockQueue.getState().enqueueAchievement(achievementId);
}
