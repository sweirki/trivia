// src/store/achievementsList.ts

export const ACHIEVEMENTS = [
  // ⭐ LEVEL PROGRESSION
  {
    id: "level_5",
    name: "Rookie",
    description: "Reach Level 5",
    icon: require("@assets/images/achievements/level.png"),
    xpReward: 25,
    type: "level",
    target: 5
  },
  {
    id: "level_10",
    name: "Intermediate",
    description: "Reach Level 10",
    icon: require("@assets/images/achievements/level.png"),
    xpReward: 50,
    type: "level",
    target: 10
  },
  {
    id: "level_20",
    name: "Pro Champion",
    description: "Reach Level 20",
    icon: require("@assets/images/achievements/level.png"),
    xpReward: 100,
    type: "level",
    target: 20
  },
  {
    id: "level_30",
    name: "Veteran",
    description: "Reach Level 30",
    icon: require("@assets/images/achievements/level.png"),
    xpReward: 150,
    type: "level",
    target: 30
  },

  // ⭐ STREAK ACHIEVEMENTS
  {
    id: "streak_5",
    name: "Momentum",
    description: "Get a 5-answer streak",
    icon: require("@assets/images/achievements/streak.png"),
    xpReward: 30,
    type: "streak",
    target: 5
  },
  {
    id: "streak_10",
    name: "On Fire",
    description: "Get a 10-answer streak",
    icon: require("@assets/images/achievements/streak.png"),
    xpReward: 75,
    type: "streak",
    target: 10
  },
  {
    id: "streak_20",
    name: "Unstoppable",
    description: "Get a 20-answer streak",
    icon: require("@assets/images/achievements/streak.png"),
    xpReward: 150,
    type: "streak",
    target: 20
  },

  // ⭐ PERFECT GAME ACHIEVEMENTS
  {
    id: "perfect_5",
    name: "Sharpshooter",
    description: "Finish a game with all answers correct (5 questions)",
    icon: require("@assets/images/achievements/perfect.webp"),
    xpReward: 50,
    type: "perfect",
    target: 5
  },
  {
    id: "perfect_10",
    name: "Flawless",
    description: "Finish a game with all answers correct (10 questions)",
    icon: require("@assets/images/achievements/perfect.webp"),
    xpReward: 100,
    type: "perfect",
    target: 10
  },

  // ⭐ ACCURACY ACHIEVEMENTS
  {
    id: "accuracy_80",
    name: "Precise",
    description: "Maintain 80% accuracy",
    icon: require("@assets/images/achievements/accuracy.webp"),
    xpReward: 40,
    type: "accuracy",
    target: 80
  },
  {
    id: "accuracy_90",
    name: "Sniper",
    description: "Maintain 90% accuracy",
    icon: require("@assets/images/achievements/accuracy.webp"),
    xpReward: 75,
    type: "accuracy",
    target: 90
  },
  {
    id: "accuracy_100",
    name: "Perfectionist",
    description: "Maintain 100% accuracy",
    icon: require("@assets/images/achievements/accuracy.webp"),
    xpReward: 150,
    type: "accuracy",
    target: 100
  },

  // ⭐ CATEGORY / MASTERY ACHIEVEMENTS
  {
    id: "master_50",
    name: "Category Master",
    description: "Answer 50 questions in one category",
    icon: require("@assets/images/achievements/master.webp"),
    xpReward: 100,
    type: "category",
    target: 50
  },
  {
    id: "master_100",
    name: "Category Grandmaster",
    description: "Answer 100 questions in one category",
    icon: require("@assets/images/achievements/master.webp"),
    xpReward: 200,
    type: "category",
    target: 100
  },

  // ⭐ COMBO ACHIEVEMENTS
  {
    id: "combo_5",
    name: "Combo Striker",
    description: "Reach a 5-combo streak",
    icon: require("@assets/images/achievements/combo.png"),
    xpReward: 25,
    type: "combo",
    target: 5
  },
  {
    id: "combo_10",
    name: "Combo Warrior",
    description: "Reach a 10-combo streak",
    icon: require("@assets/images/achievements/combo.png"),
    xpReward: 60,
    type: "combo",
    target: 10
  },

  // ⭐ GAMEPLAY VOLUME ACHIEVEMENTS
  {
    id: "games_50",
    name: "Warrior",
    description: "Play 50 games",
    icon: require("@assets/images/achievements/warrior.webp"),
    xpReward: 100,
    type: "games",
    target: 50
  },
  {
    id: "games_100",
    name: "Marathoner",
    description: "Play 100 games",
    icon: require("@assets/images/achievements/marathon.webp"),
    xpReward: 200,
    type: "games",
    target: 100
  },

  // ⭐ TOURNAMENTS
  {
    id: "tournament_1",
    name: "First Blood",
    description: "Win your first tournament",
    icon: require("@assets/images/achievements/tournament.png"),
    xpReward: 150,
    type: "tournament",
    target: 1
  },
  {
    id: "tournament_10",
    name: "Champion",
    description: "Win 10 tournaments",
    icon: require("@assets/images/achievements/tournament.png"),
    xpReward: 300,
    type: "tournament",
    target: 10
  }
];




