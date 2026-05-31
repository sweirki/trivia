import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { queueAchievementUnlock } from "./achievementUnlockQueue";

type RankedEvent = { didWin: boolean; promoted?: boolean; highestSR?: number; rankLeague?: string };
type SurvivalEvent = { rounds: number; personalBest?: boolean; milestonesUnlocked?: number[] };
type PowerEvent = { score: number; powerUpsUsed: number; efficiency?: number };
type TournamentEvent = { entered?: boolean; finalist?: boolean; champion?: boolean };

type AchievementEventsState = {
  rankedWins: number;
  rankedPromotions: number;
  highestRankedSR: number;
  highestRankLeague: string | null;
  survivalBestRounds: number;
  survivalRuns: number;
  powerRuns: number;
  powerBestScore: number;
  powerBestEfficiency: number;
  powerMasterclassRuns: number;
  noPowerControlRuns: number;
  tournamentsEntered: number;
  tournamentFinals: number;
  tournamentChampionships: number;
  seasonRewardsClaimed: number;
  recordRankedResult: (event: RankedEvent) => void;
  recordSurvivalResult: (event: SurvivalEvent) => void;
  recordPowerResult: (event: PowerEvent) => void;
  recordTournamentResult: (event: TournamentEvent) => void;
  recordSeasonReward: () => void;
  resetAchievementEvents: () => void;
};

const initialState = {
  rankedWins: 0,
  rankedPromotions: 0,
  highestRankedSR: 0,
  highestRankLeague: null as string | null,
  survivalBestRounds: 0,
  survivalRuns: 0,
  powerRuns: 0,
  powerBestScore: 0,
  powerBestEfficiency: 0,
  powerMasterclassRuns: 0,
  noPowerControlRuns: 0,
  tournamentsEntered: 0,
  tournamentFinals: 0,
  tournamentChampionships: 0,
  seasonRewardsClaimed: 0,
};

function queueIfCrossed(achievementId: string, before: number, after: number, threshold: number) {
  if (before < threshold && after >= threshold) {
    queueAchievementUnlock(achievementId);
  }
}

function normalizeLeague(value?: string | null) {
  return String(value ?? "").trim().toLowerCase();
}

export const useAchievementEventsStore = create<AchievementEventsState>()(
  persist(
    (set) => ({
      ...initialState,
      recordRankedResult: (event) => {
        set((state) => {
          const rankedWins = state.rankedWins + (event.didWin ? 1 : 0);
          const rankedPromotions = state.rankedPromotions + (event.promoted ? 1 : 0);
          const highestRankedSR = Math.max(state.highestRankedSR, event.highestSR ?? 0);
          const highestRankLeague = event.rankLeague ?? state.highestRankLeague;
          const league = normalizeLeague(highestRankLeague);

          queueIfCrossed("G6_01_RANKED_FIRST_WIN", state.rankedWins, rankedWins, 1);
          queueIfCrossed("G6_02_RANKED_PROMOTION", state.rankedPromotions, rankedPromotions, 1);
          queueIfCrossed("G6_03_RANKED_SILVER", state.highestRankedSR, highestRankedSR, 400);
          queueIfCrossed("G6_04_RANKED_GOLD", state.highestRankedSR, highestRankedSR, 800);
          queueIfCrossed("G6_05_RANKED_DIAMOND", state.highestRankedSR, highestRankedSR, 1600);

          if (!normalizeLeague(state.highestRankLeague).includes("silver") && league.includes("silver")) {
            queueAchievementUnlock("G6_03_RANKED_SILVER");
          }
          if (!normalizeLeague(state.highestRankLeague).includes("gold") && league.includes("gold")) {
            queueAchievementUnlock("G6_04_RANKED_GOLD");
          }
          if (!normalizeLeague(state.highestRankLeague).includes("diamond") && league.includes("diamond")) {
            queueAchievementUnlock("G6_05_RANKED_DIAMOND");
          }

          return {
            rankedWins,
            rankedPromotions,
            highestRankedSR,
            highestRankLeague,
          };
        });
      },
      recordSurvivalResult: (event) => {
        set((state) => {
          const survivalRuns = state.survivalRuns + 1;
          const survivalBestRounds = Math.max(state.survivalBestRounds, event.rounds);

          queueIfCrossed("G8_01_SURVIVAL_10", state.survivalBestRounds, survivalBestRounds, 10);
          queueIfCrossed("G8_02_SURVIVAL_20", state.survivalBestRounds, survivalBestRounds, 20);
          queueIfCrossed("G8_03_SURVIVAL_30", state.survivalBestRounds, survivalBestRounds, 30);
          queueIfCrossed("G8_04_SURVIVAL_40", state.survivalBestRounds, survivalBestRounds, 40);

          return { survivalRuns, survivalBestRounds };
        });
      },
      recordPowerResult: (event) => {
        const masterclass = event.score >= 25 && event.powerUpsUsed <= 2;
        const noPowerControl = event.score >= 10 && event.powerUpsUsed === 0;

        set((state) => {
          const powerRuns = state.powerRuns + 1;
          const powerBestScore = Math.max(state.powerBestScore, event.score);
          const powerBestEfficiency = Math.max(state.powerBestEfficiency, event.efficiency ?? 0);
          const powerMasterclassRuns = state.powerMasterclassRuns + (masterclass ? 1 : 0);
          const noPowerControlRuns = state.noPowerControlRuns + (noPowerControl ? 1 : 0);

          queueIfCrossed("G9_01_POWER_FIRST_RUN", state.powerRuns, powerRuns, 1);
          queueIfCrossed("G9_02_POWER_CONTROLLED_CHAOS", state.powerBestScore, powerBestScore, 18);
          queueIfCrossed("G9_03_POWER_MASTERCLASS", state.powerMasterclassRuns, powerMasterclassRuns, 1);
          queueIfCrossed("G9_04_POWER_NO_TOOLS", state.noPowerControlRuns, noPowerControlRuns, 1);

          return {
            powerRuns,
            powerBestScore,
            powerBestEfficiency,
            powerMasterclassRuns,
            noPowerControlRuns,
          };
        });
      },
      recordTournamentResult: (event) => {
        set((state) => {
          const tournamentsEntered = state.tournamentsEntered + (event.entered ? 1 : 0);
          const tournamentFinals = state.tournamentFinals + (event.finalist ? 1 : 0);
          const tournamentChampionships = state.tournamentChampionships + (event.champion ? 1 : 0);

          queueIfCrossed("G7_01_TOURNAMENT_ENTERED", state.tournamentsEntered, tournamentsEntered, 1);
          queueIfCrossed("G7_02_TOURNAMENT_FINALIST", state.tournamentFinals, tournamentFinals, 1);
          queueIfCrossed("G7_03_TOURNAMENT_CHAMPION", state.tournamentChampionships, tournamentChampionships, 1);
          queueIfCrossed("G7_04_TOURNAMENT_CHAMPION_10", state.tournamentChampionships, tournamentChampionships, 10);

          return { tournamentsEntered, tournamentFinals, tournamentChampionships };
        });
      },
      recordSeasonReward: () => {
        set((state) => {
          const seasonRewardsClaimed = state.seasonRewardsClaimed + 1;
          queueIfCrossed("G10_02_SEASON_REWARD", state.seasonRewardsClaimed, seasonRewardsClaimed, 1);
          return { seasonRewardsClaimed };
        });
      },
      resetAchievementEvents: () => set(initialState),
    }),
    {
      name: "achievement-events-store",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
