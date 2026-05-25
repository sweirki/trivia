// src/questions/dailyPools.ts
// Phase Q9: global daily curated pools.
// Builds deterministic UTC-day question pools on top of the Q1-Q8 engine.
// This intentionally does not touch persistence, rewards, or gameplay stores.

import { getDayKeyUTC } from "@/economy/economyRules";
import {
  buildQuestionSession,
  getQuestionCountForSessionMode,
  type QuestionSessionResult,
} from "./questionSession";
import {
  getPlayableQuestionPacks,
  normalizeCategoryId,
} from "./questionRegistry";
import type { NormalizedQuestion } from "./types";

export type DailyPoolVariant = "classic" | "arena";

export type DailyPoolOptions = {
  date?: Date | string;
  count?: number;
  allowPremium?: boolean;
  categories?: string[];
  excludeQuestionIds?: Array<string | number>;
  variant?: DailyPoolVariant;
};

export type DailyPoolResult = QuestionSessionResult & {
  dayKey: string;
  seed: string;
  poolId: string;
  categories: string[];
  variant: DailyPoolVariant;
};

const DEFAULT_DAILY_VARIANT: DailyPoolVariant = "classic";

function safeDateFromString(value: string) {
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return getDayKeyUTC();

  return getDayKeyUTC(parsed);
}

export function getDailyPoolDayKey(date: Date | string = new Date()) {
  if (date instanceof Date) return getDayKeyUTC(date);
  return safeDateFromString(date);
}

function hashString(value: string) {
  let hash = 2166136261;

  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededShuffle<T>(items: T[], seed: string) {
  let value = hashString(seed);
  const copy = [...items];

  const rng = () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function getEligibleDailyCategories(allowPremium: boolean) {
  return getPlayableQuestionPacks()
    .filter((pack) => allowPremium || pack.stats.free > 0)
    .map((pack) => pack.id);
}

export function buildDailyPoolSeed(
  dayKey: string,
  variant: DailyPoolVariant = DEFAULT_DAILY_VARIANT
) {
  return `global-daily:${variant}:${dayKey}`;
}

export function buildDailyPoolId(
  dayKey: string,
  variant: DailyPoolVariant = DEFAULT_DAILY_VARIANT
) {
  return `daily-${variant}-${dayKey}`;
}

export function selectDailyPoolCategories(
  options: Pick<DailyPoolOptions, "date" | "allowPremium" | "categories" | "variant"> = {}
) {
  const dayKey = getDailyPoolDayKey(options.date);
  const allowPremium = options.allowPremium === true;
  const explicitCategories = (options.categories ?? [])
    .map((category) => normalizeCategoryId(category))
    .filter((category): category is string => Boolean(category));

  const eligible = explicitCategories.length
    ? explicitCategories
    : getEligibleDailyCategories(allowPremium);

  return seededShuffle(
    Array.from(new Set(eligible)),
    `${buildDailyPoolSeed(dayKey, options.variant)}:categories`
  );
}

export function buildGlobalDailyQuestionPool(
  options: DailyPoolOptions = {}
): DailyPoolResult {
  const dayKey = getDailyPoolDayKey(options.date);
  const variant = options.variant ?? DEFAULT_DAILY_VARIANT;
  const count = Math.max(0, options.count ?? getQuestionCountForSessionMode("daily"));
  const allowPremium = options.allowPremium === true;
  const categories = selectDailyPoolCategories({
    date: dayKey,
    allowPremium,
    categories: options.categories,
    variant,
  });
  const seed = buildDailyPoolSeed(dayKey, variant);

  const session = buildQuestionSession({
    mode: "daily",
    categories,
    count,
    allowPremium,
    seed,
    excludeQuestionIds: options.excludeQuestionIds,
  });

  return {
    ...session,
    dayKey,
    seed,
    poolId: buildDailyPoolId(dayKey, variant),
    categories,
    variant,
  };
}

export function getGlobalDailyQuestionIds(options: DailyPoolOptions = {}) {
  return buildGlobalDailyQuestionPool(options).questions.map((question: NormalizedQuestion) =>
    String(question.id)
  );
}


