import React, { useMemo } from "react";
import AchievementModal from "./AchievementModal";
import { useAchievementUnlockQueue } from "../achievementUnlockQueue";

const GROUP_LABELS: Record<string, string> = {
  START: "First Moment",
  VOLUME: "Volume Milestone",
  SKILL: "Skill Milestone",
  HABIT: "Habit Milestone",
  ECONOMY: "Economy Milestone",
  RANKED: "Ranked Arena",
  TOURNAMENT: "Champion Path",
  SURVIVAL: "Survival Arena",
  POWER: "Power Arena",
  SEASON: "Season Prestige",
};

export default function GlobalAchievementUnlockLayer() {
  const queue = useAchievementUnlockQueue((state) => state.queue);
  const dismissCurrentAchievement = useAchievementUnlockQueue((state) => state.dismissCurrentAchievement);
  const current = queue[0] ?? null;

  const modalAchievement = useMemo(() => {
    if (!current) return null;

    const groupLabel = GROUP_LABELS[current.group] ?? "Prestige Moment";

    return {
      id: current.id,
      title: current.title,
      description: `${groupLabel} • ${current.description}`,
    };
  }, [current]);

  return (
    <AchievementModal
      visible={Boolean(modalAchievement)}
      achievement={modalAchievement}
      onClose={dismissCurrentAchievement}
    />
  );
}
