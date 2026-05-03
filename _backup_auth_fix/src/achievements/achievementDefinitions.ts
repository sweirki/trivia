// src/achievements/achievementDefinitions.ts

export type AchievementType = "one_time" | "progress";

export interface AchievementDefinition {
  id: string;
  group: "START" | "VOLUME" | "SKILL" | "HABIT" | "ECONOMY";
  type: AchievementType;
  threshold?: number;

  // UI
  title: string;
  description: string;

  // future-ready (optional)
  reward?: {
    xp?: number;
    coins?: number;
  };
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // ================= START =================
  {
    id: "G1_01_FIRST_GAME",
    group: "START",
    type: "one_time",
    title: "First Steps",
    description: "Finish first trivia game.",
  },
  {
    id: "G1_02_FIRST_WIN",
    group: "START",
    type: "one_time",
    title: "First Victory",
    description: "Win first trivia match.",
  },
  {
    id: "G1_03_FIRST_LOSS",
    group: "START",
    type: "one_time",
    title: "Learning Curve",
    description: "champions start somewhere.",
  },
  {
    id: "G1_04_PROFILE_CREATED",
    group: "START",
    type: "one_time",
    title: "Identity",
    description: "Create player profile.",
  },
  {
    id: "G1_05_COME_BACK_TOMORROW",
    group: "START",
    type: "one_time",
    title: "See You",
    description: "Return and play again.",
  },

  // ================= VOLUME =================
  {
    id: "G2_01_10_GAMES",
    group: "VOLUME",
    type: "progress",
    threshold: 10,
    title: "Getting Warmed Up",
    description: "Play 10 games.",
  },
  {
    id: "G2_02_50_GAMES",
    group: "VOLUME",
    type: "progress",
    threshold: 50,
    title: "Trivia Regular",
    description: "Play 50 games.",
  },
  {
    id: "G2_03_100_GAMES",
    group: "VOLUME",
    type: "progress",
    threshold: 100,
    title: "Trivia Veteran",
    description: "Play 100 games.",
  },
  {
    id: "G2_04_10_WINS",
    group: "VOLUME",
    type: "progress",
    threshold: 10,
    title: "Winner’s Mindset",
    description: "Win 10 games.",
  },
  {
    id: "G2_05_50_WINS",
    group: "VOLUME",
    type: "progress",
    threshold: 50,
    title: "Winning Habit",
    description: "Win 50 games.",
  },
  {
    id: "G2_06_100_WINS",
    group: "VOLUME",
    type: "progress",
    threshold: 100,
    title: "Unstoppable",
    description: "Win 100 games.",
  },

  // ================= SKILL =================
  {
    id: "G3_01_FLAWLESS_WIN",
    group: "SKILL",
    type: "one_time",
    title: "Flawless Victory",
    description: "Win a game.all answers correct.",
  },
  {
    id: "G3_02_SPEED_RUNNER",
    group: "SKILL",
    type: "one_time",
    title: "Speed Runner",
    description: "Win a game in under one minute.",
  },
  {
    id: "G3_03_WIN_STREAK_3",
    group: "SKILL",
    type: "progress",
    threshold: 3,
    title: "On a Roll",
    description: "Win 3 games in a row.",
  },
  {
    id: "G3_04_WIN_STREAK_5",
    group: "SKILL",
    type: "progress",
    threshold: 5,
    title: "Hot Streak",
    description: "Win 5 games in a row.",
  },
  {
    id: "G3_05_PERFECT_DAY",
    group: "SKILL",
    type: "one_time",
    title: "Perfect Day",
    description: "Win every game you play in a day.",
  },

  // ================= HABIT =================
  {
    id: "G4_01_3_DAY_STREAK",
    group: "HABIT",
    type: "progress",
    threshold: 3,
    title: "Daily Player",
    description: "Play on 3 consecutive days.",
  },
  {
    id: "G4_02_7_DAY_STREAK",
    group: "HABIT",
    type: "progress",
    threshold: 7,
    title: "Weekly Dedication",
    description: "7 days in a row.",
  },
  {
    id: "G4_03_14_DAY_STREAK",
    group: "HABIT",
    type: "progress",
    threshold: 14,
    title: "Routine",
    description: "14 consecutive days.",
  },
  {
    id: "G4_04_EARLY_BIRD",
    group: "HABIT",
    type: "one_time",
    title: "Early Bird",
    description: "Win a game early in the morning.",
  },
  {
    id: "G4_05_NIGHT_OWL",
    group: "HABIT",
    type: "one_time",
    title: "Night Owl",
    description: "Win a game late at night.",
  },

  // ================= ECONOMY =================
  {
    id: "G5_01_FIRST_COINS",
    group: "ECONOMY",
    type: "one_time",
    title: "First Earnings",
    description: "Earn your first coins.",
  },
  {
    id: "G5_02_BIG_SPENDER",
    group: "ECONOMY",
    type: "one_time",
    title: "Big Spender",
    description: "Spend coins in the shop.",
  },
  {
    id: "G5_03_CUSTOM_LOOK",
    group: "ECONOMY",
    type: "one_time",
    title: "Style Upgrade",
    description: "Customize your avatar.",
  },
  {
    id: "G5_04_SAVER",
    group: "ECONOMY",
    type: "one_time",
    title: "Coin Saver",
    description: "Save up a large amount of coins.",
  },
];
