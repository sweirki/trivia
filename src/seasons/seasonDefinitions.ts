export type SeasonTier = {
  xp: number;
  badgeId: string;
};

export type SeasonDef = {
  id: string;
  start: string; // ISO
  end: string;   // ISO
  tiers: SeasonTier[];
};

// 🔒 SINGLE ACTIVE SEASON (extend later)
export const CURRENT_SEASON: SeasonDef = {
  id: "2026-01",
  start: "2026-01-01T00:00:00.000Z",
  end: "2026-01-31T23:59:59.999Z",
  tiers: [
    { xp: 500, badgeId: "season_bronze" },
    { xp: 1500, badgeId: "season_silver" },
    { xp: 3000, badgeId: "season_gold" },
    { xp: 6000, badgeId: "season_platinum" },
  ],
};

/**
 * =========================
 * DEV SAFETY GUARDS (PHASE 7)
 * =========================
 * These prevent broken season configs from silently shipping.
 */
export function validateSeasonDef(season: SeasonDef) {
  if (!season.id) throw new Error("SeasonDef.id is required");

  const startMs = Date.parse(season.start);
  const endMs = Date.parse(season.end);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
    throw new Error("SeasonDef.start/end must be valid ISO timestamps");
  }
  if (endMs <= startMs) {
    throw new Error("SeasonDef.end must be after SeasonDef.start");
  }

  if (!Array.isArray(season.tiers) || season.tiers.length === 0) {
    throw new Error("SeasonDef.tiers must be a non-empty array");
  }

  let prevXp = -1;
  for (let i = 0; i < season.tiers.length; i++) {
    const t = season.tiers[i];
    if (!Number.isFinite(t.xp) || t.xp <= 0) {
      throw new Error(`Tier[${i}].xp must be a positive number`);
    }
    if (t.xp <= prevXp) {
      throw new Error("Tier xp thresholds must be strictly increasing");
    }
    if (!t.badgeId) {
      throw new Error(`Tier[${i}].badgeId is required`);
    }
    prevXp = t.xp;
  }
}

// Auto-validate at module load in dev.
validateSeasonDef(CURRENT_SEASON);

/** Helper: badgeId for a final tier (1-based). Returns null if tier=0/invalid. */
export function badgeIdForTier(tier: number): string | null {
  if (!tier || tier <= 0) return null;
  return CURRENT_SEASON.tiers[tier - 1]?.badgeId ?? null;
}


