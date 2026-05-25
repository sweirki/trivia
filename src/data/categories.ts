
const animalsIcon = require("../../assets/images/categories/icons/animals_icon.webp");
const animeIcon = require("../../assets/images/categories/icons/anime_icon.webp");
const carsIcon = require("../../assets/images/categories/icons/cars_icon.webp");
const celebritiesIcon = require("../../assets/images/categories/icons/celebrities_icon.webp");
const comicsIcon = require("../../assets/images/categories/icons/comics_icon.webp");
const fashionIcon = require("../../assets/images/categories/icons/fashion_icon.webp");
const foodIcon = require("../../assets/images/categories/icons/food_icon.webp");
const footballIcon = require("../../assets/images/categories/icons/football_icon.webp");
const gamingIcon = require("../../assets/images/categories/icons/gaming_icon.webp");
const generalknowledgeIcon = require("../../assets/images/categories/icons/generalknowledge_icon.webp");
const geographyIcon = require("../../assets/images/categories/icons/geography_icon.webp");
const historyIcon = require("../../assets/images/categories/icons/history_icon.webp");
const horrorIcon = require("../../assets/images/categories/icons/horror_icon.webp");
const internetIcon = require("../../assets/images/categories/icons/internet_icon.webp");
const kpopIcon = require("../../assets/images/categories/icons/kpop_icon.webp");
const literatureIcon = require("../../assets/images/categories/icons/literature_icon.webp");
const logicIcon = require("../../assets/images/categories/icons/logic_icon.webp");
const mathIcon = require("../../assets/images/categories/icons/math_icon.webp");
const memesIcon = require("../../assets/images/categories/icons/memes_icon.webp");
const moviesIcon = require("../../assets/images/categories/icons/movies_icon.webp");
const musicIcon = require("../../assets/images/categories/icons/music_icon.webp");
const natureIcon = require("../../assets/images/categories/icons/nature_icon.webp");
const scienceIcon = require("../../assets/images/categories/icons/science_icon.webp");
const spaceIcon = require("../../assets/images/categories/icons/space_icon.webp");




// src/data/categories.ts
import {
  getPlayableQuestionPacks,
  hasPlayableQuestionPack,
  normalizeCategoryId,
} from "@/questions/questionRegistry";

export type CategoryId = string;

export type Category = {
  id: CategoryId;
  label: string;
  premium: boolean;
  price: number;
  icon: any;
  color: string;
  hasQuestions: boolean;
  questionKey?: string;
  questionCount?: number;
  autoDiscovered?: boolean;
};

type CategoryShell = Omit<Category, "hasQuestions" | "questionKey" | "questionCount" | "autoDiscovered">;

const CATEGORY_SHELLS: CategoryShell[] = [
  { id: "geography",  label: "Geography", premium: false, price: 0,
  icon: geographyIcon,  color: "#4CAF50" },
  { id: "science",  label: "Science", premium: false, price: 0,
  icon: scienceIcon,  color: "#2196F3" },
  { id: "history",  label: "History", premium: false, price: 0,
  icon: historyIcon,  color: "#FF9800" },
  { id: "movies",  label: "Movies", premium: false, price: 0,
  icon: moviesIcon,  color: "#9C27B0" },
  { id: "tvshows", label: "TV Shows", premium: false, price: 0,
  icon: moviesIcon, color: "#7E57C2" },
  { id: "generalknowledge", label: "General Knowledge", premium: false, price: 0, icon: generalknowledgeIcon, color: "#FBC02D" },

  // Shells below become playable automatically once a matching JSON file exists.
  { id: "music",  label: "Music", premium: false, price: 0,
  icon: musicIcon,  color: "#E91E63" },
  { id: "literature",  label: "Literature", premium: false, price: 0,
  icon: literatureIcon,  color: "#00BCD4" },
  { id: "football", label: "Football", premium: false, price: 0,
  icon: footballIcon, color: "#1E88E5" },
  { id: "sports", label: "Sports", premium: false, price: 0,
  icon: footballIcon, color: "#FF5722" },
  { id: "comics", label: "Comics", premium: false, price: 0,
  icon: comicsIcon, color: "#7E57C2" },
  { id: "fashion", label: "Fashion", premium: false, price: 0,
  icon: fashionIcon, color: "#FBC02D" },
  { id: "horror", label: "Horror", premium: false, price: 0,
  icon: horrorIcon, color: "#8E24AA" },
  { id: "internet", label: "Internet", premium: false, price: 0,
  icon: internetIcon, color: "#C2185B" },
  { id: "kpop", label: "K-Pop", premium: false, price: 0,
  icon: kpopIcon, color: "#FFB300" },
  { id: "memes", label: "Memes", premium: false, price: 0,
  icon: memesIcon, color: "#E91E63" },
  { id: "popculture", label: "Pop Culture", premium: false, price: 0,
  icon: celebritiesIcon, color: "#673AB7" },
  { id: "logic",  label: "Logic", premium: false, price: 0,
  icon: logicIcon,  color: "#009688" },
  { id: "math", label: "Math", premium: false, price: 0,
  icon: mathIcon, color: "#00BCD4" },
  { id: "technology", label: "Technology", premium: false, price: 0, icon: internetIcon, color: "#00ACC1" },
  { id: "gaming",  label: "Gaming", premium: false, price: 0,
  icon: gamingIcon,  color: "#3F51B5" },
  { id: "anime",  label: "Anime", premium: true, price: 4.99,
  icon: animeIcon,  color: "#F06292" },
  { id: "celebrities",  label: "Celebrities", premium: true, price: 3.99,
  icon: celebritiesIcon,  color: "#FFD700" },
  { id: "food",  label: "Food", premium: true, price: 2.99,
  icon: foodIcon,  color: "#FF7043" },
  { id: "space",  label: "Space", premium: true, price: 3.99,
  icon: spaceIcon,  color: "#7E57C2" },
  { id: "mythology", label: "Mythology", premium: true, price: 4.99, icon: animeIcon, color: "#8D6E63" },
  { id: "animals",  label: "Animals", premium: true, price: 2.99,
  icon: animalsIcon,  color: "#66BB6A" },
  { id: "funfacts", label: "Fun Facts", premium: true, price: 1.99, icon: animalsIcon, color: "#42A5F5" },
  { id: "psychology", label: "Psychology", premium: true, price: 3.49, icon: celebritiesIcon, color: "#AB47BC" },
  { id: "cars",  label: "Cars", premium: true, price: 2.49,
  icon: carsIcon,  color: "#26A69A" },
  { id: "worldrecords", label: "World Records", premium: true, price: 4.49, icon: carsIcon, color: "#EF5350" },
  { id: "business", label: "Business", premium: true, price: 3.99, icon: logicIcon, color: "#5C6BC0" },
  { id: "riddles", label: "Riddles", premium: true, price: 4.99, icon: gamingIcon, color: "#8E24AA" },
  { id: "ai", label: "AI & Technology", premium: true, price: 5.99, icon: moviesIcon, color: "#00E5FF" },
];

const COLOR_POOL = [
  "#4CAF50",
  "#2196F3",
  "#FF9800",
  "#9C27B0",
  "#FBC02D",
  "#E91E63",
  "#00BCD4",
  "#FF5722",
  "#673AB7",
  "#009688",
];

const shellById = CATEGORY_SHELLS.reduce<Record<string, CategoryShell>>((acc, shell) => {
  const id = normalizeCategoryId(shell.id) ?? shell.id;
  acc[id] = { ...shell, id };
  return acc;
}, {});

function colorForId(id: string) {
  const sum = id.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return COLOR_POOL[sum % COLOR_POOL.length];
}

const playableFromRegistry: Category[] = getPlayableQuestionPacks().map((pack) => {
  const shell = shellById[pack.id];

  return {
    id: pack.id,
    label: shell?.label ?? pack.label,
    premium: shell?.premium ?? false,
    price: shell?.price ?? 0,
    icon: shell?.icon ?? null,
    color: shell?.color ?? colorForId(pack.id),
    hasQuestions: true,
    questionKey: pack.id,
    questionCount: pack.questionCount,
    autoDiscovered: !shell,
  };
});

const playableIds = new Set(playableFromRegistry.map((category) => category.id));

const comingSoonShells: Category[] = CATEGORY_SHELLS
  .map((shell) => ({ ...shell, id: normalizeCategoryId(shell.id) ?? shell.id }))
  .filter((shell) => !playableIds.has(shell.id))
  .map((shell) => ({
    ...shell,
    hasQuestions: false,
    questionKey: undefined,
    questionCount: 0,
    autoDiscovered: false,
  }));

export const PLAYABLE_CATEGORIES: Category[] = playableFromRegistry;
export const CATEGORIES: Category[] = [...PLAYABLE_CATEGORIES, ...comingSoonShells];

export function getCategoryById(id?: string | null) {
  if (!id) return undefined;
  const normalized = normalizeCategoryId(id);
  return CATEGORIES.find((category) => category.id === normalized);
}

export function getPlayableCategoryById(id?: string | null) {
  if (!id || !hasPlayableQuestionPack(id)) return undefined;
  return getCategoryById(id);
}



