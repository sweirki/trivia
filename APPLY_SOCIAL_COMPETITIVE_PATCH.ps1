$ErrorActionPreference = "Stop"

# Trivia Sweirki - Arena Social Competitive Layer Patch
# Safe targeted patch: creates rival history store and inserts small UI/recording hooks.

$storeDir = "src\arena\store"
New-Item -ItemType Directory -Force -Path $storeDir | Out-Null

$storePath = Join-Path $storeDir "useArenaRivalHistoryStore.ts"
@'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type RivalMatchOutcome = "win" | "loss" | "draw";

export type RivalMatchRecord = {
  id: string;
  ts: number;
  rivalId?: string;
  rivalName: string;
  rivalTitle?: string;
  rivalStyle?: string;
  outcome: RivalMatchOutcome;
  playerScore: number;
  rivalScore: number;
  srDelta: number;
};

export type RivalProfileSummary = {
  rivalName: string;
  rivalTitle?: string;
  rivalStyle?: string;
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  lastOutcome?: RivalMatchOutcome;
  lastPlayedAt?: number;
};

type ArenaRivalHistoryState = {
  records: RivalMatchRecord[];
  recordMatch: (record: Omit<RivalMatchRecord, "id" | "ts">) => void;
  getRivalProfile: (rivalName?: string | null) => RivalProfileSummary | null;
  clearRivalHistory: () => void;
};

const MAX_RECORDS = 40;

const uid = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

function summarize(records: RivalMatchRecord[], rivalName?: string | null): RivalProfileSummary | null {
  if (!rivalName) return null;

  const matches = records.filter((record) => record.rivalName === rivalName);
  if (!matches.length) return null;

  const latest = matches[0];

  return {
    rivalName,
    rivalTitle: latest.rivalTitle,
    rivalStyle: latest.rivalStyle,
    matches: matches.length,
    wins: matches.filter((record) => record.outcome === "win").length,
    losses: matches.filter((record) => record.outcome === "loss").length,
    draws: matches.filter((record) => record.outcome === "draw").length,
    lastOutcome: latest.outcome,
    lastPlayedAt: latest.ts,
  };
}

export const useArenaRivalHistoryStore = create<ArenaRivalHistoryState>()(
  persist(
    (set, get) => ({
      records: [],

      recordMatch: (record) => {
        const entry: RivalMatchRecord = {
          id: uid(),
          ts: Date.now(),
          ...record,
        };

        set({
          records: [entry, ...get().records].slice(0, MAX_RECORDS),
        });
      },

      getRivalProfile: (rivalName) => summarize(get().records, rivalName),

      clearRivalHistory: () => set({ records: [] }),
    }),
    {
      name: "arena-rival-history-store",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
'@ | Set-Content -LiteralPath $storePath -Encoding UTF8

# Patch RankedMatch.tsx
$rankedMatchPath = "app\(app)\arena_reset\ranked\RankedMatch.tsx"
if (!(Test-Path -LiteralPath $rankedMatchPath)) {
  throw "Missing file: $rankedMatchPath"
}

$match = Get-Content -LiteralPath $rankedMatchPath -Raw

if ($match -notmatch 'useArenaRivalHistoryStore') {
  $match = $match -replace 'import \{ useArenaOpponentAI \} from "@/arena/store/useArenaOpponentAI";', 'import { useArenaOpponentAI } from "@/arena/store/useArenaOpponentAI";`r`nimport { useArenaRivalHistoryStore } from "@/arena/store/useArenaRivalHistoryStore";'
}

if ($match -notmatch 'rivalryLabel') {
  $needle = '  const rivalStyle = opponent?.style ?? "Adaptive pressure";'
  $insert = @'
  const rivalStyle = opponent?.style ?? "Adaptive pressure";
  const rivalProfile = useArenaRivalHistoryStore((state) => state.getRivalProfile(rivalName));
  const rivalryLabel = rivalProfile
    ? `Series ${rivalProfile.wins}-${rivalProfile.losses}-${rivalProfile.draws} • ${rivalProfile.lastOutcome === "win" ? "You won last duel" : rivalProfile.lastOutcome === "loss" ? "Rival won last duel" : "Last duel was a draw"}`
    : "First recorded duel";
'@
  if ($match -notmatch [regex]::Escape($needle)) { throw "Could not find rivalStyle insertion point in RankedMatch.tsx" }
  $match = $match.Replace($needle, $insert)
}

if ($match -notmatch 'styles.rivalRecordText') {
  $match = $match -replace '<Text style=\{styles\.playerSub\}>\{rivalTitle\}</Text>', '<Text style={styles.playerSub}>{rivalTitle}</Text>`r`n              <Text style={styles.rivalRecordText}>{rivalryLabel}</Text>'
  $match = $match -replace '<Text style=\{styles\.rivalText\}>Opponent: \{rivalName\} • \{rivalStyle\}</Text>', '<Text style={styles.rivalText}>Opponent: {rivalName} • {rivalStyle}</Text>`r`n            <Text style={styles.rivalRecordText}>{rivalryLabel}</Text>'
}

if ($match -notmatch 'rivalRecordText:') {
  $match = $match -replace '(\s+playerSub:\s*\{[\s\S]*?\n\s*\},)', '$1`r`n`r`n  rivalRecordText: {`r`n    color: "#8FEAFF",`r`n    fontSize: 10.5,`r`n    fontWeight: "900",`r`n    textAlign: "center",`r`n    marginTop: 4,`r`n  },'
}

Set-Content -LiteralPath $rankedMatchPath -Value $match -Encoding UTF8

# Patch RankedResult.tsx: record rival history after ranked history addMatch.
$rankedResultPath = "app\(app)\arena_reset\ranked\RankedResult.tsx"
if (!(Test-Path -LiteralPath $rankedResultPath)) {
  throw "Missing file: $rankedResultPath"
}

$result = Get-Content -LiteralPath $rankedResultPath -Raw

if ($result -notmatch 'useArenaRivalHistoryStore') {
  $result = $result -replace 'import \{ useRankedHistoryStore \} from "@/arena/store/useRankedHistoryStore";', 'import { useRankedHistoryStore } from "@/arena/store/useRankedHistoryStore";`r`nimport { useArenaRivalHistoryStore } from "@/arena/store/useArenaRivalHistoryStore";'
}

if ($result -notmatch 'recordMatch\(\{\s*\r?\n\s*rivalId') {
  $pattern = '    addMatch\(\{\s*\r?\n\s*result: didWin \? "win" : isDraw \? "draw" : "loss",\s*\r?\n\s*playerScore,\s*\r?\n\s*opponentScore,\s*\r?\n\s*srBefore,\s*\r?\n\s*srAfter: updatedSR,\s*\r?\n\s*srDelta,\s*\r?\n\s*\}\);'
  $replacement = @'
    addMatch({
      result: didWin ? "win" : isDraw ? "draw" : "loss",
      playerScore,
      opponentScore,
      srBefore,
      srAfter: updatedSR,
      srDelta,
    });

    useArenaRivalHistoryStore.getState().recordMatch({
      rivalId: opponent?.id,
      rivalName: opponent?.name ?? "Arena Rival",
      rivalTitle: opponent?.title,
      rivalStyle: opponent?.style,
      outcome: didWin ? "win" : isDraw ? "draw" : "loss",
      playerScore,
      rivalScore: opponentScore,
      srDelta,
    });
'@
  if ($result -notmatch $pattern) { throw "Could not find addMatch block in RankedResult.tsx" }
  $result = [regex]::Replace($result, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $replacement }, 1)
}

Set-Content -LiteralPath $rankedResultPath -Value $result -Encoding UTF8

Write-Host "Arena Social Competitive patch applied."
Write-Host "Changed/created:"
Write-Host "- src/arena/store/useArenaRivalHistoryStore.ts"
Write-Host "- app/(app)/arena_reset/ranked/RankedMatch.tsx"
Write-Host "- app/(app)/arena_reset/ranked/RankedResult.tsx"
Write-Host ""
Write-Host "Now run: npm run typecheck; npm run lint; npm test"
