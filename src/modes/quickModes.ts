export const quickModes = {
  classic: {
    label: "Classic",
    perQuestionTimer: 12000,
    globalTimer: null,
    lives: null,
    scoreMultiplier: 1,
  },

  speed: {
    label: "Speed",
    perQuestionTimer: 6000,   // DIFFERENT
    globalTimer: null,
    lives: null,
    scoreMultiplier: 1.5,     // DIFFERENT
  },

  sudden: {
    label: "Sudden Death",
    perQuestionTimer: 10000,
    globalTimer: null,
    lives: 1,
    scoreMultiplier: 2,
  },

  timed60: {
    label: "60 Seconds",
    perQuestionTimer: null,
    globalTimer: 60000,
    lives: null,
    scoreMultiplier: 1,
  },

  timed90: {
    label: "90 Seconds",
    perQuestionTimer: null,
    globalTimer: 90000,
    lives: null,
    scoreMultiplier: 1,
  },

  categories: {
    label: "Categories",
    perQuestionTimer: 12000,
    globalTimer: null,
    lives: null,
    scoreMultiplier: 1,
    category: "general",       // IMPORTANT
  },
};




