// src/live/liveUtils.ts
export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const randomName = () => {
  const animals = ["Fox", "Owl", "Badger", "Unicorn", "Hawk", "Wolf"];
  const adjectives = ["Brave", "Clever", "Sly", "Happy", "Swift", "Magic"];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${
    animals[Math.floor(Math.random() * animals.length)]
  }`;
};

export const pickRandom = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

export const formatScore = (score: number) => `${score} pts`;
