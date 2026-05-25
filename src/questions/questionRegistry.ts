// src/questions/questionRegistry.ts
// Phase Q2 question registry.
// Supports category folders with pack files:
//
// assets/data/questions/<category>/pack-001.json
//
// Metro note: after adding/removing question JSON files, restart Expo with:
// npx expo start -c

import { getQuestionCategoryMetadata as resolveQuestionCategoryMetadata } from "./questionCategories";
import { normalizeQuestions } from "./normalizeQuestions";
import type {
  Difficulty,
  DifficultyBreakdown,
  NormalizedQuestion,
  QuestionContext,
  QuestionPackStats,
  QuestionRegistryIssue,
  RawQuestion,
  RegisteredQuestionPack,
} from "./types";

type MetroRequire = {
  (path: string): unknown;
  context?: (
    directory: string,
    useSubdirectories: boolean,
    regExp: RegExp
  ) => QuestionContext;
};

declare const require: MetroRequire;

type StaticQuestionPackModule = {
  category: string;
  fileName: string;
  packId: string;
  moduleValue: unknown;
};

const LABEL_OVERRIDES: Record<string, string> = {
  generalknowledge: "General Knowledge",
  "general-knowledge": "General Knowledge",
  general: "General Knowledge",
  gk: "General Knowledge",
  kpop: "K-Pop",
  tvshows: "TV Shows",
  popculture: "Pop Culture",
  funfacts: "Fun Facts",
  worldrecords: "World Records",
  ai: "AI & Technology",
};

const ALIASES: Record<string, string> = {
  general: "general",
  gk: "general",
  generalknowledge: "general",
  general_knowledge: "general",
  "general-knowledge": "general",
  "general knowledge": "general",
  generalKnowledge: "general",
  geography: "geography",
  geo: "geography",
  science: "science",
  history: "history",
  movies: "movies",
  movie: "movies",
  film: "movies",
  cinema: "movies",
  cars: "cars",
  car: "cars",
  football: "football",
  soccer: "football",
  "k-pop": "kpop",
  k_pop: "kpop",
  kpop: "kpop",
  meme: "memes",
  memes: "memes",
  tv: "tvshows",
  "tv-shows": "tvshows",
  tv_shows: "tvshows",
  tvshows: "tvshows",
};

const EMPTY_DIFFICULTY_BREAKDOWN: DifficultyBreakdown = {
  easy: 0,
  medium: 0,
  hard: 0,
  expert: 0,
};

const STATIC_QUESTION_PACK_MODULES: StaticQuestionPackModule[] = [
  { category: "animals", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/animals/pack-001.json") },
  { category: "animals", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/animals/pack-002.json") },
  { category: "animals", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/animals/pack-003.json") },
  { category: "animals", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/animals/pack-004.json") },
  { category: "animals", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/animals/pack-005.json") },
  { category: "anime", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/anime/pack-001.json") },
  { category: "anime", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/anime/pack-002.json") },
  { category: "anime", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/anime/pack-003.json") },
  { category: "anime", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/anime/pack-004.json") },
  { category: "anime", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/anime/pack-005.json") },
  { category: "cars", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/cars/pack-001.json") },
  { category: "cars", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/cars/pack-002.json") },
  { category: "cars", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/cars/pack-003.json") },
  { category: "cars", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/cars/pack-004.json") },
  { category: "cars", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/cars/pack-005.json") },
  { category: "celebrities", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/celebrities/pack-001.json") },
  { category: "celebrities", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/celebrities/pack-002.json") },
  { category: "celebrities", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/celebrities/pack-003.json") },
  { category: "celebrities", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/celebrities/pack-004.json") },
  { category: "celebrities", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/celebrities/pack-005.json") },
  { category: "comics", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/comics/pack-001.json") },
  { category: "comics", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/comics/pack-002.json") },
  { category: "comics", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/comics/pack-003.json") },
  { category: "comics", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/comics/pack-004.json") },
  { category: "comics", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/comics/pack-005.json") },
  { category: "fashion", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/fashion/pack-001.json") },
  { category: "fashion", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/fashion/pack-002.json") },
  { category: "fashion", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/fashion/pack-003.json") },
  { category: "fashion", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/fashion/pack-004.json") },
  { category: "fashion", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/fashion/pack-005.json") },
  { category: "food", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/food/pack-001.json") },
  { category: "food", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/food/pack-002.json") },
  { category: "food", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/food/pack-003.json") },
  { category: "food", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/food/pack-004.json") },
  { category: "food", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/food/pack-005.json") },
  { category: "football", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/football/pack-001.json") },
  { category: "football", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/football/pack-002.json") },
  { category: "football", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/football/pack-003.json") },
  { category: "football", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/football/pack-004.json") },
  { category: "football", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/football/pack-005.json") },
  { category: "gaming", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/gaming/pack-001.json") },
  { category: "gaming", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/gaming/pack-002.json") },
  { category: "gaming", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/gaming/pack-003.json") },
  { category: "gaming", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/gaming/pack-004.json") },
  { category: "gaming", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/gaming/pack-005.json") },
  { category: "general", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/general/pack-001.json") },
  { category: "general", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/general/pack-002.json") },
  { category: "general", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/general/pack-003.json") },
  { category: "general", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/general/pack-004.json") },
  { category: "general", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/general/pack-005.json") },
  { category: "geography", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/geography/pack-001.json") },
  { category: "geography", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/geography/pack-002.json") },
  { category: "geography", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/geography/pack-003.json") },
  { category: "geography", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/geography/pack-004.json") },
  { category: "geography", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/geography/pack-005.json") },
  { category: "history", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/history/pack-001.json") },
  { category: "history", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/history/pack-002.json") },
  { category: "history", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/history/pack-003.json") },
  { category: "history", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/history/pack-004.json") },
  { category: "history", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/history/pack-005.json") },
  { category: "horror", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/horror/pack-001.json") },
  { category: "horror", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/horror/pack-002.json") },
  { category: "horror", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/horror/pack-003.json") },
  { category: "horror", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/horror/pack-004.json") },
  { category: "horror", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/horror/pack-005.json") },
  { category: "internet", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/internet/pack-001.json") },
  { category: "internet", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/internet/pack-002.json") },
  { category: "internet", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/internet/pack-003.json") },
  { category: "internet", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/internet/pack-004.json") },
  { category: "internet", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/internet/pack-005.json") },
  { category: "kpop", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/kpop/pack-001.json") },
  { category: "kpop", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/kpop/pack-002.json") },
  { category: "kpop", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/kpop/pack-003.json") },
  { category: "kpop", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/kpop/pack-004.json") },
  { category: "kpop", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/kpop/pack-005.json") },
  { category: "literature", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/literature/pack-001.json") },
  { category: "literature", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/literature/pack-002.json") },
  { category: "literature", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/literature/pack-003.json") },
  { category: "literature", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/literature/pack-004.json") },
  { category: "literature", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/literature/pack-005.json") },
  { category: "logic", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/logic/pack-001.json") },
  { category: "logic", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/logic/pack-002.json") },
  { category: "logic", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/logic/pack-003.json") },
  { category: "logic", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/logic/pack-004.json") },
  { category: "logic", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/logic/pack-005.json") },
  { category: "memes", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/memes/pack-001.json") },
  { category: "memes", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/memes/pack-002.json") },
  { category: "memes", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/memes/pack-003.json") },
  { category: "memes", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/memes/pack-004.json") },
  { category: "memes", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/memes/pack-005.json") },
  { category: "movies", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/movies/pack-001.json") },
  { category: "movies", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/movies/pack-002.json") },
  { category: "movies", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/movies/pack-003.json") },
  { category: "movies", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/movies/pack-004.json") },
  { category: "movies", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/movies/pack-005.json") },
  { category: "music", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/music/pack-001.json") },
  { category: "music", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/music/pack-002.json") },
  { category: "music", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/music/pack-003.json") },
  { category: "music", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/music/pack-004.json") },
  { category: "music", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/music/pack-005.json") },
  { category: "mythology", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/mythology/pack-001.json") },
  { category: "mythology", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/mythology/pack-002.json") },
  { category: "mythology", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/mythology/pack-003.json") },
  { category: "mythology", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/mythology/pack-004.json") },
  { category: "mythology", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/mythology/pack-005.json") },
  { category: "science", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/science/pack-001.json") },
  { category: "science", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/science/pack-002.json") },
  { category: "science", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/science/pack-003.json") },
  { category: "science", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/science/pack-004.json") },
  { category: "science", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/science/pack-005.json") },
  { category: "space", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/space/pack-001.json") },
  { category: "space", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/space/pack-002.json") },
  { category: "space", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/space/pack-003.json") },
  { category: "space", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/space/pack-004.json") },
  { category: "space", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/space/pack-005.json") },
  { category: "sports", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/sports/pack-001.json") },
  { category: "sports", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/sports/pack-002.json") },
  { category: "sports", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/sports/pack-003.json") },
  { category: "sports", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/sports/pack-004.json") },
  { category: "sports", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/sports/pack-005.json") },
  { category: "superheroes", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/superheroes/pack-001.json") },
  { category: "superheroes", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/superheroes/pack-002.json") },
  { category: "superheroes", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/superheroes/pack-003.json") },
  { category: "superheroes", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/superheroes/pack-004.json") },
  { category: "superheroes", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/superheroes/pack-005.json") },
  { category: "technology", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/technology/pack-001.json") },
  { category: "technology", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/technology/pack-002.json") },
  { category: "technology", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/technology/pack-003.json") },
  { category: "technology", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/technology/pack-004.json") },
  { category: "technology", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/technology/pack-005.json") },
  { category: "tvshows", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/tvshows/pack-001.json") },
  { category: "tvshows", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/tvshows/pack-002.json") },
  { category: "tvshows", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/tvshows/pack-003.json") },
  { category: "tvshows", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/tvshows/pack-004.json") },
  { category: "tvshows", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/tvshows/pack-005.json") },
  { category: "wrestling", fileName: "pack-001.json", packId: "pack-001", moduleValue: require("../../assets/data/questions/wrestling/pack-001.json") },
  { category: "wrestling", fileName: "pack-002.json", packId: "pack-002", moduleValue: require("../../assets/data/questions/wrestling/pack-002.json") },
  { category: "wrestling", fileName: "pack-003.json", packId: "pack-003", moduleValue: require("../../assets/data/questions/wrestling/pack-003.json") },
  { category: "wrestling", fileName: "pack-004.json", packId: "pack-004", moduleValue: require("../../assets/data/questions/wrestling/pack-004.json") },
  { category: "wrestling", fileName: "pack-005.json", packId: "pack-005", moduleValue: require("../../assets/data/questions/wrestling/pack-005.json") },
];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function cleanPath(path: string) {
  return path.replace(/^\.\//, "").replace(/\.json$/i, "");
}

function normalizePathCategory(value: string | null | undefined): string | null {
  const raw = String(value || "").trim();
  if (!raw) return null;

  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

export function normalizeCategoryId(value: string | null | undefined): string | null {
  const raw = String(value || "").trim();
  if (!raw) return null;

  const lower = raw.toLowerCase();
  const compact = lower.replace(/[\s_-]+/g, "");

  return ALIASES[raw] ?? ALIASES[lower] ?? ALIASES[compact] ?? compact;
}

function labelFromId(id: string) {
  if (LABEL_OVERRIDES[id]) return LABEL_OVERRIDES[id];

  return id
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function unwrapQuestionArray(raw: unknown): RawQuestion[] {
  const value: unknown = Array.isArray(raw)
    ? raw
    : isObject(raw)
      ? "default" in raw
        ? raw.default
        : undefined
      : undefined;

  if (!Array.isArray(value)) return [];

  if (value.length === 1 && Array.isArray(value[0])) {
    return value[0].filter(isObject) as RawQuestion[];
  }

  return value.filter(isObject) as RawQuestion[];
}

function getQuestionContext(): QuestionContext | null {
  if (typeof require === "undefined" || typeof require.context !== "function") {
    return null;
  }

  return require.context("../../assets/data/questions", true, /\.json$/);
}

function getCategoryFromContextKey(key: string): string | null {
  const clean = cleanPath(key);
  const parts = clean.split("/").filter(Boolean);

  if (parts.length >= 2) {
    return normalizeCategoryId(parts[0]);
  }

  return normalizeCategoryId(parts[0]);
}

function getFileNameFromContextKey(key: string): string {
  const clean = cleanPath(key);
  const parts = clean.split("/").filter(Boolean);
  return `${parts[parts.length - 1] ?? clean}.json`;
}

function getRawPackEntries() {
  const context = getQuestionContext();

  if (!context) {
    return STATIC_QUESTION_PACK_MODULES;
  }

  return context.keys().map((key) => {
    const category = getCategoryFromContextKey(key) ?? "general";

    return {
      category,
      fileName: getFileNameFromContextKey(key),
      packId: cleanPath(key),
      moduleValue: context(key),
    };
  });
}

function normalizePackQuestions(
  raw: RawQuestion[],
  categoryId: string
): NormalizedQuestion[] {
  return normalizeQuestions(raw).map((question) => ({
    ...question,
    category: categoryId,
    tags: Array.from(new Set([categoryId, question.difficulty, ...question.tags])),
  }));
}

function createEmptyStats(packCount: number, emptyPackCount: number): QuestionPackStats {
  return {
    total: 0,
    premium: 0,
    free: 0,
    difficulty: { ...EMPTY_DIFFICULTY_BREAKDOWN },
    packCount,
    emptyPackCount,
  };
}

function buildStats(
  questions: NormalizedQuestion[],
  packCount: number,
  emptyPackCount: number
): QuestionPackStats {
  const stats = createEmptyStats(packCount, emptyPackCount);

  questions.forEach((question) => {
    stats.total += 1;
    if (question.premium) stats.premium += 1;
    else stats.free += 1;
    stats.difficulty[question.difficulty as Difficulty] += 1;
  });

  return stats;
}

function getQuestionTextKey(question: NormalizedQuestion) {
  return `${question.category}:${question.text.trim().toLowerCase()}`;
}

function dedupeQuestions(
  questions: NormalizedQuestion[],
  category: string,
  issues: QuestionRegistryIssue[]
): NormalizedQuestion[] {
  const seenIds = new Set<string>();
  const seenTexts = new Set<string>();

  return questions.filter((question) => {
    const idKey = String(question.id).trim().toLowerCase();
    const textKey = getQuestionTextKey(question);

    if (seenIds.has(idKey)) {
      issues.push({
        type: "duplicate-id",
        category,
        questionId: question.id,
        message: `Duplicate question id "${question.id}" was skipped.`,
      });
      return false;
    }

    if (seenTexts.has(textKey)) {
      issues.push({
        type: "duplicate-text",
        category,
        questionId: question.id,
        message: `Duplicate question text was skipped.`,
      });
      return false;
    }

    seenIds.add(idKey);
    seenTexts.add(textKey);
    return true;
  });
}

function buildRegistry(): RegisteredQuestionPack[] {
  const grouped = getRawPackEntries().reduce<
    Record<
      string,
      {
        files: string[];
        rawQuestions: NormalizedQuestion[];
        errors: string[];
        issues: QuestionRegistryIssue[];
        emptyPackCount: number;
      }
    >
  >((acc, entry) => {
    const categoryId =
      normalizePathCategory(entry.category) ?? normalizeCategoryId(entry.category) ?? "general";

    if (!acc[categoryId]) {
      acc[categoryId] = {
        files: [],
        rawQuestions: [],
        errors: [],
        issues: [],
        emptyPackCount: 0,
      };
    }

    acc[categoryId].files.push(entry.fileName);

    const raw = unwrapQuestionArray(entry.moduleValue);

    if (!raw.length) {
      acc[categoryId].emptyPackCount += 1;
      acc[categoryId].issues.push({
        type: "empty-pack",
        category: categoryId,
        fileName: entry.fileName,
        message: `${entry.fileName} is empty and was ignored.`,
      });
      return acc;
    }

    try {
      acc[categoryId].rawQuestions.push(...normalizePackQuestions(raw, categoryId));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      acc[categoryId].errors.push(`${entry.fileName}: ${message}`);
      acc[categoryId].issues.push({
        type: "normalization-error",
        category: categoryId,
        fileName: entry.fileName,
        message,
      });
    }

    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([id, group]) => {
      const metadata = resolveQuestionCategoryMetadata(id, labelFromId(id));
      const issues = [...group.issues];
      const normalized = dedupeQuestions(group.rawQuestions, id, issues);
      const valid = normalized.length > 0 && group.errors.length === 0;

      return {
        id,
        fileName: group.files[0] ?? `${id}.json`,
        label: metadata.displayName,
        raw: normalized,
        questionCount: normalized.length,
        valid,
        error: group.errors.length ? group.errors.join("; ") : undefined,
        packFiles: group.files.sort(),
        packCount: group.files.length,
        metadata,
        stats: buildStats(normalized, group.files.length, group.emptyPackCount),
        issues,
      } satisfies RegisteredQuestionPack;
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

const REGISTRY = buildRegistry();

const REGISTRY_BY_ID = REGISTRY.reduce<Record<string, RegisteredQuestionPack>>(
  (acc, pack) => {
    acc[pack.id] = pack;
    return acc;
  },
  {}
);

const ALL_QUESTIONS = REGISTRY.flatMap((pack) => pack.raw);

export function getRegisteredQuestionPacks() {
  return REGISTRY;
}

export function getPlayableQuestionPacks() {
  return REGISTRY.filter((pack) => pack.valid && pack.questionCount > 0);
}

export function getQuestionPack(category: string | null | undefined) {
  const id = normalizeCategoryId(category);
  return id ? REGISTRY_BY_ID[id] : undefined;
}

export function hasPlayableQuestionPack(category: string | null | undefined) {
  const pack = getQuestionPack(category);
  return Boolean(pack?.valid && pack.questionCount > 0);
}

export function getQuestionCategoryMetadata(category: string | null | undefined) {
  const id = normalizeCategoryId(category);
  return id ? REGISTRY_BY_ID[id]?.metadata : undefined;
}

export function getQuestionCount(category?: string | null) {
  if (!category) return ALL_QUESTIONS.length;
  return getQuestionPack(category)?.questionCount ?? 0;
}

export function getDifficultyBreakdown(category?: string | null): DifficultyBreakdown {
  if (category) {
    return getQuestionPack(category)?.stats.difficulty ?? { ...EMPTY_DIFFICULTY_BREAKDOWN };
  }

  return REGISTRY.reduce<DifficultyBreakdown>(
    (acc, pack) => {
      acc.easy += pack.stats.difficulty.easy;
      acc.medium += pack.stats.difficulty.medium;
      acc.hard += pack.stats.difficulty.hard;
      acc.expert += pack.stats.difficulty.expert;
      return acc;
    },
    { ...EMPTY_DIFFICULTY_BREAKDOWN }
  );
}

export function getPremiumQuestionCount(category?: string | null) {
  if (category) return getQuestionPack(category)?.stats.premium ?? 0;

  return REGISTRY.reduce((total, pack) => total + pack.stats.premium, 0);
}

export function getRegistryIssues() {
  return REGISTRY.flatMap((pack) => pack.issues);
}

export function getQuestionsByCategory(category: string | null | undefined) {
  return getQuestionPack(category)?.raw ?? [];
}

export function getQuestionsByDifficulty(
  category: string | null | undefined,
  difficulty: Difficulty
) {
  return getQuestionsByCategory(category).filter((question) => question.difficulty === difficulty);
}

export function getMixedQuestionPool(categories?: string[]) {
  if (!categories?.length) return ALL_QUESTIONS;

  return categories.flatMap((category) => getQuestionsByCategory(category));
}

export function getRandomQuestionsByCategory(
  category: string | null | undefined,
  count: number,
  difficulty?: Difficulty
) {
  const pool = difficulty
    ? getQuestionsByDifficulty(category, difficulty)
    : getQuestionsByCategory(category);

  return shuffleQuestions(pool).slice(0, Math.max(0, count));
}

export function getRandomQuestionsByDifficulty(difficulty: Difficulty, count: number) {
  const pool = ALL_QUESTIONS.filter((question) => question.difficulty === difficulty);
  return shuffleQuestions(pool).slice(0, Math.max(0, count));
}

function shuffleQuestions<T>(questions: T[]) {
  const copy = [...questions];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export type { NormalizedQuestion, RawQuestion, RegisteredQuestionPack };


