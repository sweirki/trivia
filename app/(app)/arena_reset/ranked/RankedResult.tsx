import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";

import { useArenaStore } from "@/arena/store/useArenaStore";
import { useArenaRankSystem } from "@/arena/store/useArenaRankSystem";
import { useRankedHistoryStore } from "@/arena/store/useRankedHistoryStore";
import { useArenaRewardsEngine } from "@/arena/store/useArenaRewardsEngine";
import { useTournamentStore } from "@/arena/store/useTournamentStore";
import AnimatedProgressBar from "@/components/AnimatedProgressBar";
import {
  buildRankedPrestigeState,
  getRankProgress,
} from "@/arena/ranked/rankedPrestige";

type CompetitiveResult = {
  mode: "ranked";
  outcome: "win" | "loss";
  score: number;
  correctAnswers: number;
  questionsAnswered: number;
  durationSec: number;
};

const reportCompetitiveResult = (_result: CompetitiveResult) => {};

export default function RankedResult() {
  const { daily } = useLocalSearchParams<{ daily?: string }>();
  const { player, opponent, resetArena } = useArenaStore();
  const { sr, rank, winStreak, addWin, addLoss } = useArenaRankSystem();
  const addMatch = useRankedHistoryStore((state) => state.addMatch);
  const rewardRanked = useArenaRewardsEngine((state) => state.rewardRanked);
  const previewRanked = useArenaRewardsEngine((state) => state.previewRanked);
  const markTournamentPlayed = useTournamentStore((state) => state.markTournamentPlayed);
  const lastDailyPlayedAt = useTournamentStore((state) => state.lastDailyPlayedAt);

  const playerScore = player?.score ?? 0;
  const opponentScore = opponent?.score ?? 0;
  const didWin = playerScore > opponentScore;
  const isDraw = playerScore === opponentScore;
  const srBefore = sr;
  const rankBefore = rank;
  const rewardPreview = useMemo(() => previewRanked({ didWin, playerScore }), [didWin, playerScore, previewRanked]);

  const [srAfter, setSrAfter] = useState(sr);
  const [rankAfter, setRankAfter] = useState(rank);
  const [streakAfter, setStreakAfter] = useState(winStreak);
  const [srDisplay, setSrDisplay] = useState(0);
  const [rewardApplied, setRewardApplied] = useState({ coins: 0, arenaTokens: 0 });

  const srAnim = useRef(new Animated.Value(0)).current;
  const heroPulse = useRef(new Animated.Value(1)).current;
  const appliedRef = useRef(false);

  useEffect(() => {
    if (appliedRef.current) return;
    appliedRef.current = true;

    if (didWin) {
      addWin(opponent?.sr ?? srBefore);
    } else {
      addLoss(opponent?.sr ?? srBefore);
    }

    const updatedRankState = useArenaRankSystem.getState();
    const updatedSR = updatedRankState.sr;
    const srDelta = updatedSR - srBefore;

    setSrAfter(updatedSR);
    setRankAfter(updatedRankState.rank);
    setStreakAfter(updatedRankState.winStreak);

    const listener = srAnim.addListener(({ value }) => {
      setSrDisplay(Math.round(value));
    });

    Animated.parallel([
      Animated.timing(srAnim, {
        toValue: Math.abs(srDelta),
        duration: 720,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(heroPulse, {
          toValue: 1.025,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(heroPulse, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    addMatch({
      result: didWin ? "win" : "loss",
      playerScore,
      opponentScore,
      srBefore,
      srAfter: updatedSR,
      srDelta,
    });

    const today = new Date().toDateString();
    const alreadyClaimedDailyArena =
      !!lastDailyPlayedAt && new Date(lastDailyPlayedAt).toDateString() === today;

    if (daily === "1" && !alreadyClaimedDailyArena) {
      const reward = rewardRanked({ didWin, playerScore });
      setRewardApplied(reward);
      markTournamentPlayed();
    } else if (daily !== "1") {
      const reward = rewardRanked({ didWin, playerScore });
      setRewardApplied(reward);
    }

    reportCompetitiveResult({
      mode: "ranked",
      outcome: didWin ? "win" : "loss",
      score: playerScore,
      correctAnswers: playerScore,
      questionsAnswered: Math.max(playerScore + opponentScore, 1),
      durationSec: 0,
    });

    return () => srAnim.removeListener(listener);
  }, [
    addLoss,
    addMatch,
    addWin,
    didWin,
    heroPulse,
    opponent?.sr,
    opponentScore,
    playerScore,
    rewardRanked,
    daily,
    lastDailyPlayedAt,
    markTournamentPlayed,
    srAnim,
    srBefore,
  ]);

  const srDiff = srAfter - srBefore;
  const srDiffText =
    srDiff > 0 ? `+${srDisplay}` : srDiff < 0 ? `-${srDisplay}` : "0";

  const prestige = useMemo(
    () =>
      buildRankedPrestigeState({
        didWin,
        srBefore,
        srAfter,
        rankBefore,
        rankAfter,
        winStreak: streakAfter,
      }),
    [didWin, srBefore, srAfter, rankBefore, rankAfter, streakAfter]
  );

  const resultTitle = isDraw
    ? "NARROW BATTLE"
    : didWin
      ? "VICTORY CLAIMED"
      : "DEFEAT RECORDED";

  const resultSubtitle = isDraw
    ? "Close fight. Refocus and take the next one."
    : didWin
      ? "Momentum gained. Your season climb moves forward."
      : "Recover quickly. Protect your division.";

  const ceremonyIcon = didWin ? "🏆" : isDraw ? "⚔️" : "🛡️";

  const pressureMessage = prestige.promoted
    ? "Promotion secured. Your new division is unlocked — now defend it."
    : prestige.promotionPressure
      ? "Promotion is close. One strong run can push you over the line."
      : prestige.dangerZone
        ? "Danger zone active. Your next win matters."
        : didWin
          ? "Momentum secured. Stack SR before the season reset."
          : "Recover quickly. One clean win can stop the slide.";

  const continueLabel = didWin
    ? "Continue Climb"
    : isDraw
      ? "Run It Back"
      : "Recover Rank";

  const handleContinue = () => {
    resetArena();
    router.replace("/(app)/arena_reset");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ transform: [{ scale: heroPulse }] }}>
        <LinearGradient
          colors={didWin ? ["#44350E", "#11111B"] : ["#3A1D22", "#11111B"]}
          style={styles.hero}
        >
          <Text style={styles.eyebrow}>RANKED CEREMONY</Text>
          <Text style={styles.ceremonyIcon}>{ceremonyIcon}</Text>
          <Text style={styles.resultTitle}>{resultTitle}</Text>
          <Text style={styles.resultSubtitle}>{resultSubtitle}</Text>

          <View style={styles.badgeRow}>
            {prestige.promoted && <Text style={styles.goldBadge}>PROMOTED</Text>}
            {prestige.promotionPressure && (
              <Text style={styles.goldBadge}>PROMOTION NEAR</Text>
            )}
            {prestige.dangerZone && <Text style={styles.redBadge}>DANGER ZONE</Text>}
            {streakAfter >= 2 && <Text style={styles.greenBadge}>{streakAfter} STREAK</Text>}
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.scoreBox}>
        <View style={styles.scoreColumn}>
          <Text style={styles.label}>YOU</Text>
          <Text style={styles.score}>{playerScore}</Text>
        </View>

        <View style={styles.vsPill}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        <View style={styles.scoreColumn}>
          <Text style={styles.label}>RIVAL</Text>
          <Text style={styles.score}>{opponentScore}</Text>
        </View>
      </View>

      <View style={styles.rewardPanel}>
        <Text style={styles.panelEyebrow}>LADDER IMPACT</Text>
        <Text style={styles.panelTitle}>Skill Rating</Text>

        <View style={styles.srRow}>
          <View>
            <Text style={styles.srLabel}>Before</Text>
            <Text style={styles.srMuted}>{srBefore}</Text>
          </View>

          <Animated.Text
            style={[
              styles.srChange,
              { color: srDiff >= 0 ? "#52D273" : "#FF5D5D" },
            ]}
          >
            {srDiffText}
          </Animated.Text>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.srLabel}>Now</Text>
            <Text style={styles.srNow}>{srAfter}</Text>
          </View>
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.panelEyebrow}>CURRENT DIVISION</Text>
            <Text style={styles.panelTitle}>{prestige.rankLabel}</Text>
            <Text style={styles.panelSubtitle}>
              {prestige.nextRankLabel && prestige.srToNext !== null
                ? `${prestige.srToNext} SR to ${prestige.nextRankLabel}`
                : "Elite rank ceiling reached"}
            </Text>
          </View>

          <View style={styles.progressBadge}>
            <Text style={styles.progressMeta}>
              {Math.round(getRankProgress(srAfter, rankAfter))}%
            </Text>
          </View>
        </View>

        <AnimatedProgressBar
          percent={prestige.progressPercent}
          height={8}
          fillColor={
            prestige.dangerZone
              ? "#FF5D5D"
              : prestige.promotionPressure
                ? "#F7C948"
                : "#52D273"
          }
          trackColor="#2A2A38"
          glowColor={
            prestige.dangerZone
              ? "#FF5D5D"
              : prestige.promotionPressure
                ? "#F7C948"
                : "#52D273"
          }
          style={styles.progressWrapper}
        />
      </View>

      <View style={styles.panelDark}>
        <Text style={styles.panelEyebrow}>PRESSURE REPORT</Text>
        <Text style={styles.panelTitle}>Rank Pressure</Text>
        <Text style={styles.pressureText}>{pressureMessage}</Text>
      </View>

      <View style={styles.dopaminePanel}>
        <Text style={styles.dopamineTitle}>
          {didWin ? "Momentum Rewarded" : "Recovery Challenge"}
        </Text>
        <Text style={styles.dopamineText}>
          {didWin
            ? "Ranked history, rewards, and season climb were updated."
            : "Your ranked history was updated. Return to the ladder and reclaim momentum."}
        </Text>
      </View>

      <View style={styles.dopaminePanel}>
        <Text style={styles.dopamineTitle}>Arena Reward</Text>
        <Text style={styles.dopamineText}>
          {didWin
            ? `You won +${rewardApplied.coins || rewardPreview.coins} coins and +${rewardApplied.arenaTokens || rewardPreview.arenaTokens} arena tokens.`
            : "No coins awarded on a ranked loss. Entry cost was spent when you joined."}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.continueBtn, { backgroundColor: didWin ? "#F7C948" : "#FF5D5D" }]}
        onPress={handleContinue}
        activeOpacity={0.9}
      >
        <Text style={styles.continueText}>{continueLabel}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090912",
  },
  content: {
    paddingTop: 42,
    paddingHorizontal: 14,
    paddingBottom: 190,
  },
  hero: {
    borderRadius: 18,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(247,201,72,0.28)",
    alignItems: "center",
  },
  eyebrow: {
    color: "#F7C948",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  ceremonyIcon: {
    fontSize: 28,
    marginTop: 5,
  },
  resultTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    marginTop: 4,
    textAlign: "center",
  },
  resultSubtitle: {
    color: "#D8D5E5",
    fontSize: 11,
    lineHeight: 15,
    marginTop: 5,
    textAlign: "center",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
    justifyContent: "center",
  },
  goldBadge: {
    color: "#2B2100",
    backgroundColor: "#F7C948",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 9,
    fontWeight: "900",
  },
  redBadge: {
    color: "#FFFFFF",
    backgroundColor: "#C0392B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 9,
    fontWeight: "900",
  },
  greenBadge: {
    color: "#062817",
    backgroundColor: "#52D273",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 9,
    fontWeight: "900",
  },
  scoreBox: {
    backgroundColor: "#151521",
    borderRadius: 16,
    padding: 11,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#292944",
  },
  scoreColumn: {
    alignItems: "center",
    flex: 1,
  },
  label: {
    color: "#A8A4B8",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  score: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 2,
  },
  vsPill: {
    backgroundColor: "#2B2415",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#F7C948",
  },
  vsText: {
    color: "#F7C948",
    fontSize: 10,
    fontWeight: "900",
  },
  rewardPanel: {
    backgroundColor: "#171423",
    borderRadius: 16,
    padding: 11,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(247,201,72,0.22)",
  },
  panel: {
    backgroundColor: "#151521",
    borderRadius: 16,
    padding: 11,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  panelDark: {
    backgroundColor: "#101018",
    borderRadius: 16,
    padding: 11,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(247,201,72,0.18)",
  },
  dopaminePanel: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 11,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#26344f",
  },
  dopamineTitle: {
    color: "#BBD7FF",
    fontSize: 14,
    fontWeight: "900",
  },
  dopamineText: {
    color: "#b7bfd2",
    fontSize: 11,
    lineHeight: 15,
    marginTop: 5,
  },
  panelEyebrow: {
    color: "#F7C948",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 4,
  },
  panelTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  panelSubtitle: {
    color: "#B8B5C8",
    fontSize: 11,
    marginTop: 3,
  },
  srRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  srLabel: {
    color: "#8E8AA0",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 3,
  },
  srMuted: {
    color: "#8E8AA0",
    fontSize: 15,
    fontWeight: "800",
  },
  srChange: {
    fontSize: 24,
    fontWeight: "900",
  },
  srNow: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressBadge: {
    backgroundColor: "#2B2415",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#F7C948",
    marginLeft: 10,
  },
  progressMeta: {
    color: "#F7C948",
    fontSize: 13,
    fontWeight: "900",
  },
  progressWrapper: {
    height: 8,
    backgroundColor: "#2A2A38",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 10,
  },
  pressureText: {
    color: "#D8D5E5",
    fontSize: 11,
    lineHeight: 15,
    marginTop: 5,
  },
  continueBtn: {
    paddingVertical: 11,
    borderRadius: 13,
    alignItems: "center",
  },
  continueText: {
    color: "#181300",
    fontSize: 14,
    fontWeight: "900",
  },
});

