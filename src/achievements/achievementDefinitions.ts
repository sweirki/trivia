// src/achievements/achievementDefinitions.ts

export type AchievementType = "one_time" | "progress";

export interface AchievementDefinition {
  id: string;
  group: "START" | "VOLUME" | "SKILL" | "HABIT" | "ECONOMY" | "RANKED" | "TOURNAMENT" | "SURVIVAL" | "POWER" | "SEASON";
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

  // ================= RANKED =================
  {
    id: "G6_01_RANKED_FIRST_WIN",
    group: "RANKED",
    type: "one_time",
    title: "Ranked Breakthrough",
    description: "Win your first Ranked Arena duel.",
  },
  {
    id: "G6_02_RANKED_PROMOTION",
    group: "RANKED",
    type: "one_time",
    title: "Promotion Secured",
    description: "Promote to a higher division.",
  },
  {
    id: "G6_03_RANKED_SILVER",
    group: "RANKED",
    type: "one_time",
    title: "Silver Challenger",
    description: "Reach Silver rank.",
  },
  {
    id: "G6_04_RANKED_GOLD",
    group: "RANKED",
    type: "one_time",
    title: "Gold Warrior",
    description: "Reach Gold rank.",
  },
  {
    id: "G6_05_RANKED_DIAMOND",
    group: "RANKED",
    type: "one_time",
    title: "Diamond Elite",
    description: "Reach Diamond rank.",
  },

  // ================= TOURNAMENT =================
  {
    id: "G7_01_TOURNAMENT_ENTERED",
    group: "TOURNAMENT",
    type: "one_time",
    title: "Champion Path",
    description: "Enter your first Tournament Arena run.",
  },
  {
    id: "G7_02_TOURNAMENT_FINALIST",
    group: "TOURNAMENT",
    type: "one_time",
    title: "Finalist",
    description: "Reach a Tournament Final.",
  },
  {
    id: "G7_03_TOURNAMENT_CHAMPION",
    group: "TOURNAMENT",
    type: "one_time",
    title: "Tournament Champion",
    description: "Win a full Tournament Arena run.",
  },
  {
    id: "G7_04_TOURNAMENT_CHAMPION_10",
    group: "TOURNAMENT",
    type: "progress",
    threshold: 10,
    title: "Crown Collector",
    description: "Win 10 tournaments.",
  },

  // ================= SURVIVAL =================
  {
    id: "G8_01_SURVIVAL_10",
    group: "SURVIVAL",
    type: "one_time",
    title: "10 Round Survivor",
    description: "Survive 10 rounds in Survival Arena.",
  },
  {
    id: "G8_02_SURVIVAL_20",
    group: "SURVIVAL",
    type: "one_time",
    title: "Iron Will",
    description: "Survive 20 rounds in Survival Arena.",
  },
  {
    id: "G8_03_SURVIVAL_30",
    group: "SURVIVAL",
    type: "one_time",
    title: "Last Stand",
    description: "Survive 30 rounds in Survival Arena.",
  },
  {
    id: "G8_04_SURVIVAL_40",
    group: "SURVIVAL",
    type: "one_time",
    title: "Survival Legend",
    description: "Survive 40 rounds in Survival Arena.",
  },

  // ================= POWER =================
  {
    id: "G9_01_POWER_FIRST_RUN",
    group: "POWER",
    type: "one_time",
    title: "Power Initiate",
    description: "Complete your first Power Arena run.",
  },
  {
    id: "G9_02_POWER_CONTROLLED_CHAOS",
    group: "POWER",
    type: "one_time",
    title: "Controlled Chaos",
    description: "Score 18 or higher in Power Arena.",
  },
  {
    id: "G9_03_POWER_MASTERCLASS",
    group: "POWER",
    type: "one_time",
    title: "Power Masterclass",
    description: "Score 25+ while using 2 or fewer power-ups.",
  },
  {
    id: "G9_04_POWER_NO_TOOLS",
    group: "POWER",
    type: "one_time",
    title: "No-Tool Control",
    description: "Score 10+ without using a power-up.",
  },

  // ================= SEASON =================
  {
    id: "G10_01_SEASON_STARTED",
    group: "SEASON",
    type: "one_time",
    title: "Season Debut",
    description: "Begin your first ranked season.",
  },
  {
    id: "G10_02_SEASON_REWARD",
    group: "SEASON",
    type: "one_time",
    title: "Season Reward",
    description: "Claim a season prestige reward.",
  },
];




