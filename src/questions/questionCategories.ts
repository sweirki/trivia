// src/questions/questionCategories.ts
// Phase Q2: central metadata for question categories.

import type { QuestionCategoryMetadata } from "./types";

export const QUESTION_CATEGORY_METADATA = {
  animals: { key: "animals", displayName: "Animals", icon: "paw", premium: false },
  anime: { key: "anime", displayName: "Anime", icon: "sparkles", premium: true },
  cars: { key: "cars", displayName: "Cars", icon: "car-sport", premium: true },
  celebrities: { key: "celebrities", displayName: "Celebrities", icon: "star", premium: true },
  comics: { key: "comics", displayName: "Comics", icon: "book", premium: true },
  fashion: { key: "fashion", displayName: "Fashion", icon: "shirt", premium: true },
  food: { key: "food", displayName: "Food", icon: "restaurant", premium: true },
  football: { key: "football", displayName: "Football", icon: "football", premium: true },
  gaming: { key: "gaming", displayName: "Gaming", icon: "game-controller", premium: true },
  general: { key: "general", displayName: "General Knowledge", icon: "earth", premium: false },
  geography: { key: "geography", displayName: "Geography", icon: "map", premium: true },
  history: { key: "history", displayName: "History", icon: "hourglass", premium: true },
  horror: { key: "horror", displayName: "Horror", icon: "skull", premium: true },
  internet: { key: "internet", displayName: "Internet", icon: "globe", premium: true },
  kpop: { key: "kpop", displayName: "K-Pop", icon: "musical-notes", premium: true },
  literature: { key: "literature", displayName: "Literature", icon: "library", premium: true },
  logic: { key: "logic", displayName: "Logic", icon: "bulb", premium: true },
  memes: { key: "memes", displayName: "Memes", icon: "happy", premium: true },
  movies: { key: "movies", displayName: "Movies", icon: "film", premium: true },
  music: { key: "music", displayName: "Music", icon: "musical-note", premium: true },
  mythology: { key: "mythology", displayName: "Mythology", icon: "flash", premium: true },
  science: { key: "science", displayName: "Science", icon: "flask", premium: false },
  space: { key: "space", displayName: "Space", icon: "planet", premium: true },
  sports: { key: "sports", displayName: "Sports", icon: "trophy", premium: true },
  superheroes: { key: "superheroes", displayName: "Superheroes", icon: "shield", premium: true },
  technology: { key: "technology", displayName: "Technology", icon: "hardware-chip", premium: true },
  tvshows: { key: "tvshows", displayName: "TV Shows", icon: "tv", premium: true },
  wrestling: { key: "wrestling", displayName: "Wrestling", icon: "medal", premium: true },
} satisfies Record<string, QuestionCategoryMetadata>;

export function getQuestionCategoryMetadata(
  key: string,
  fallbackLabel?: string
): QuestionCategoryMetadata {
  return (
    QUESTION_CATEGORY_METADATA[key] ?? {
      key,
      displayName: fallbackLabel ?? key,
      icon: "help-circle",
      premium: false,
    }
  );
}

export function getAllQuestionCategoryMetadata(): QuestionCategoryMetadata[] {
  return Object.values(QUESTION_CATEGORY_METADATA).sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  );
}
