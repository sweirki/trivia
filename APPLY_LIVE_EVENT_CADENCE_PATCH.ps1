$ErrorActionPreference = "Stop"

function Write-Utf8File($Path, $Content) {
  $dir = Split-Path -Parent $Path
  if ($dir -and !(Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }
  Set-Content -LiteralPath $Path -Value $Content -Encoding UTF8
}

# 1) Add deterministic weekly Arena live-event cadence helper.
$liveEventPath = "src\arena\live\arenaLiveEvents.ts"
$liveEventContent = @'
// src/arena/live/arenaLiveEvents.ts
// Lightweight Arena live-event cadence helper.
// Deterministic local schedule for now; safe to replace with remote config later.

export type ArenaLiveEventMode = "ranked" | "survival" | "power" | "tournament";

export type ArenaLiveEvent = {
  id: string;
  label: string;
  title: string;
  body: string;
  modeFocus: ArenaLiveEventMode;
  modifierLabel: string;
  rewardLabel: string;
  startsAt: string;
  endsAt: string;
  accent: string;
};

const EVENT_ROTATION: Array<Omit<ArenaLiveEvent, "startsAt" | "endsAt">> = [
  {
    id: "lightning-cup",
    label: "WEEKLY EVENT",
    title: "Lightning Cup",
    body: "Ranked pressure week: faster rival reveals and extra prestige focus.",
    modeFocus: "ranked",
    modifierLabel: "Ranked pressure",
    rewardLabel: "Bonus Arena Tokens on strong ranked wins",
    accent: "#8FEAFF",
  },
  {
    id: "survival-gauntlet",
    label: "WEEKLY EVENT",
    title: "Survival Gauntlet",
    body: "Push your personal best and chase milestone prestige before reset.",
    modeFocus: "survival",
    modifierLabel: "Personal-best chase",
    rewardLabel: "Milestone runs are spotlighted this week",
    accent: "#9FE7FF",
  },
  {
    id: "power-lab",
    label: "WEEKLY EVENT",
    title: "Power Lab",
    body: "Efficiency week: win with fewer boosts and flex cleaner strategy.",
    modeFocus: "power",
    modifierLabel: "Efficiency spotlight",
    rewardLabel: "No-power and low-power runs get prestige framing",
    accent: "#C58CFF",
  },
  {
    id: "bracket-weekend",
    label: "WEEKLY EVENT",
    title: "Bracket Weekend",
    body: "Tournament prestige week: chase podium history and champion identity.",
    modeFocus: "tournament",
    modifierLabel: "Tournament prestige",
    rewardLabel: "Champion placements are highlighted this week",
    accent: "#FFD34D",
  },
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * MS_PER_DAY;
const ROTATION_EPOCH_UTC = Date.UTC(2026, 0, 5, 0, 0, 0); // Monday, Jan 5 2026 UTC.

function getWeekWindow(now: Date) {
  const nowMs = now.getTime();
  const weekIndex = Math.max(0, Math.floor((nowMs - ROTATION_EPOCH_UTC) / MS_PER_WEEK));
  const startsAtMs = ROTATION_EPOCH_UTC + weekIndex * MS_PER_WEEK;
  return {
    weekIndex,
    startsAt: new Date(startsAtMs),
    endsAt: new Date(startsAtMs + MS_PER_WEEK),
  };
}

export function getActiveArenaLiveEvent(now = new Date()): ArenaLiveEvent {
  const { weekIndex, startsAt, endsAt } = getWeekWindow(now);
  const event = EVENT_ROTATION[weekIndex % EVENT_ROTATION.length];

  return {
    ...event,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
  };
}

export function formatLiveEventTimeRemaining(endsAtIso: string, now = new Date()) {
  const endsAt = new Date(endsAtIso).getTime();
  const remaining = Math.max(0, endsAt - now.getTime());
  const days = Math.floor(remaining / MS_PER_DAY);
  const hours = Math.floor((remaining % MS_PER_DAY) / (60 * 60 * 1000));

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h left`;
  return "Ending soon";
}

export function getArenaLiveEventModeTag(mode: ArenaLiveEventMode, activeEvent = getActiveArenaLiveEvent()) {
  if (activeEvent.modeFocus !== mode) return null;
  return "EVENT";
}
'@
Write-Utf8File $liveEventPath $liveEventContent

# 2) Patch Arena Hub to show actual rotating event instead of hardcoded Lightning copy.
$arenaHubPath = "app\(app)\arena_reset\index.tsx"
if (!(Test-Path -LiteralPath $arenaHubPath)) {
  throw "Could not find $arenaHubPath"
}
$content = Get-Content -LiteralPath $arenaHubPath -Raw

if ($content -notmatch 'arenaLiveEvents') {
  $content = $content -replace 'import \{ ARENA_MODE_CONFIG, formatArenaCost \} from "@/arena/arenaEconomyRules";', 'import { ARENA_MODE_CONFIG, formatArenaCost } from "@/arena/arenaEconomyRules";`r`nimport { formatLiveEventTimeRemaining, getActiveArenaLiveEvent, getArenaLiveEventModeTag } from "@/arena/live/arenaLiveEvents";'
}

if ($content -notmatch 'const activeLiveEvent = getActiveArenaLiveEvent') {
  $content = $content -replace '(const arenaBannerSource = getCosmeticAssetSource\(equippedArenaBanner\?\.icon\);)', '$1`r`n  const activeLiveEvent = getActiveArenaLiveEvent();`r`n  const activeLiveEventTimeLeft = formatLiveEventTimeRemaining(activeLiveEvent.endsAt);'
}

# Replace hardcoded event card labels/copy.
$content = $content -replace '<Text style=\{styles\.eventLabel\}>LIMITED EVENT</Text>\s*<Text style=\{styles\.eventTitle\}>Lightning Cup Weekend</Text>\s*<Text style=\{styles\.eventBody\}>\s*Faster timers\. Higher SR pressure\. Exclusive rewards\.\s*</Text>', '<Text style={styles.eventLabel}>{activeLiveEvent.label} • {activeLiveEventTimeLeft}</Text>`r`n        <Text style={styles.eventTitle}>{activeLiveEvent.title}</Text>`r`n        <Text style={styles.eventBody}>`r`n          {activeLiveEvent.body}`r`n        </Text>`r`n        <Text style={styles.eventReward}>{activeLiveEvent.rewardLabel}</Text>'

# Ensure eventReward style exists.
if ($content -notmatch 'eventReward:') {
  $content = $content -replace '(\s+eventBody:\s*\{[^}]+\},)', '$1`r`n  eventReward: {`r`n    color: "#8FEAFF",`r`n    fontSize: 11,`r`n    lineHeight: 15,`r`n    fontWeight: "900",`r`n    marginTop: 6,`r`n  },'
}

# Add EVENT tag priority to each Arena mode card while preserving existing logic.
$content = $content -replace 'tag=\{\s*isNearPromotion\s*\? "PROMOTION"\s*:\s*isDangerZone\s*\? "PROTECT"\s*:\s*"COMPETITIVE"\s*\}', 'tag={getArenaLiveEventModeTag("ranked", activeLiveEvent) ?? (isNearPromotion ? "PROMOTION" : isDangerZone ? "PROTECT" : "COMPETITIVE")}'
$content = $content -replace 'tag="ENDURANCE"', 'tag={getArenaLiveEventModeTag("survival", activeLiveEvent) ?? "ENDURANCE"}'
$content = $content -replace 'tag="POWER"', 'tag={getArenaLiveEventModeTag("power", activeLiveEvent) ?? "POWER"}'
$content = $content -replace 'tag="BRACKET"', 'tag={getArenaLiveEventModeTag("tournament", activeLiveEvent) ?? "BRACKET"}'

Set-Content -LiteralPath $arenaHubPath -Value $content -Encoding UTF8

Write-Host "Arena Live Event Cadence patch applied."
Write-Host "Changed/created:"
Write-Host "- src/arena/live/arenaLiveEvents.ts"
Write-Host "- app/(app)/arena_reset/index.tsx"
Write-Host ""
Write-Host "Now run: npm run typecheck; npm run lint; npm test"
