import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
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
import type { RankedIntegrityBreakdown } from "@/arena/store/useArenaRankSystem";
import { useRankedHistoryStore } from "@/arena/store/useRankedHistoryStore";
import { useArenaRivalHistoryStore } from "@/arena/store/useArenaRivalHistoryStore";
import { useArenaRewardsEngine } from "@/arena/store/useArenaRewardsEngine";
import { useTournamentStore } from "@/arena/store/useTournamentStore";
import {
  getArenaSeasonReward,
  getRankLabel,
} from "@/arena/season/arenaSeasonPrestige";
import AnimatedProgressBar from "@/components/AnimatedProgressBar";
import {
  buildRankedPrestigeState,
  getRankProgress,
} from "@/arena/ranked/rankedPrestige";

type CompetitiveResult = {
  mode: "ranked";
  outcome: "win" | "loss" | "draw";
  score: number;
  correctAnswers: number;
  questionsAnswered: number;
  durationSec: number;
};

const RANKED_VICTORY_HERO = require("../../../../assets/images/arena/ranked/ranked_victory_hero.webp");
const RANKED_DEFEAT_HERO = require("../../../../assets/images/arena/ranked/ranked_defeat_hero.webp");

const reportCompetitiveResult = (_result: CompetitiveResult) => {};

export default function RankedResult() {
  const { daily } = useLocalSearchParams<{ daily?: string }>();
  const { player, opponent, questions, lastRankedResult, resetArena } = useArenaStore();
  const {
    sr,
    rank,
    winStreak,
    highestSR,
    highestRank,
    addWin,
    addLoss,
    addDraw,
  } = useArenaRankSystem();
  const addMatch = useRankedHistoryStore((state) => state.addMatch);
  const rewardRanked = useArenaRewardsEngine((state) => state.rewardRanked);
  const previewRanked = useArenaRewardsEngine((state) => state.previewRanked);
  const markTournamentPlayed = useTournamentStore(
    (state) => state.markTournamentPlayed,
  );
  const lastDailyPlayedAt = useTournamentStore(
    (state) => state.lastDailyPlayedAt,
  );

  const playerScore = lastRankedResult?.playerScore ?? player?.score ?? 0;
  const opponentScore = lastRankedResult?.opponentScore ?? opponent?.score ?? 0;
  const opponentSRForResult = lastRankedResult?.opponentSR ?? opponent?.sr ?? sr;
  const opponentIdForResult = lastRankedResult?.opponentId ?? opponent?.id;
  const opponentNameForResult = lastRankedResult?.opponentName ?? opponent?.name ?? "Arena Rival";
  const opponentTitleForResult = lastRankedResult?.opponentTitle ?? opponent?.title;
  const opponentStyleForResult = lastRankedResult?.opponentStyle ?? opponent?.style;
  const didWin = playerScore > opponentScore;
  const isDraw = playerScore === opponentScore;
  const srBefore = sr;
  const rankBefore = rank;
  const questionsAnswered = Math.max(
  1,
  lastRankedResult?.questionsAnswered ??
    (questions.length > 0 ? questions.length : 7)
);
  const rankedContext = useMemo(
    () => ({ playerScore, opponentScore, questionsAnswered }),
    [opponentScore, playerScore, questionsAnswered],
  );
  const rewardPreview = useMemo(
    () => previewRanked({ didWin, playerScore }),
    [didWin, playerScore, previewRanked],
  );
  const seasonReward = useMemo(
    () => getArenaSeasonReward(highestSR),
    [highestSR],
  );

  const [srAfter, setSrAfter] = useState(sr);
  const [rankAfter, setRankAfter] = useState(rank);
  const [streakAfter, setStreakAfter] = useState(winStreak);
  const [srDisplay, setSrDisplay] = useState(0);
  const [rewardApplied, setRewardApplied] = useState({
    coins: 0,
    arenaTokens: 0,
  });
  const [integrityBreakdown, setIntegrityBreakdown] =
    useState<RankedIntegrityBreakdown | null>(null);

  const srAnim = useRef(new Animated.Value(0)).current;
  const heroPulse = useRef(new Animated.Value(1)).current;
  const appliedRef = useRef(false);

  useEffect(() => {
    if (appliedRef.current) return;
    appliedRef.current = true;

    const opponentSR = opponentSRForResult;
    const breakdown = didWin
      ? addWin(opponentSR, rankedContext)
      : isDraw
        ? addDraw(opponentSR, rankedContext)
        : addLoss(
            opponentSR,
            Math.abs(playerScore - opponentScore) <= 1,
            rankedContext,
          );

    setIntegrityBreakdown(breakdown);

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
      result: didWin ? "win" : isDraw ? "draw" : "loss",
      playerScore,
      opponentScore,
      srBefore,
      srAfter: updatedSR,
      srDelta,
    });

    useArenaRivalHistoryStore.getState().recordMatch({
      rivalId: opponentIdForResult,
      rivalName: opponentNameForResult,
      rivalTitle: opponentTitleForResult,
      rivalStyle: opponentStyleForResult,
      outcome: didWin ? "win" : isDraw ? "draw" : "loss",
      playerScore,
      rivalScore: opponentScore,
      srDelta,
    });

    const today = new Date().toDateString();
    const alreadyClaimedDailyArena =
      !!lastDailyPlayedAt &&
      new Date(lastDailyPlayedAt).toDateString() === today;

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
      outcome: didWin ? "win" : isDraw ? "draw" : "loss",
      score: playerScore,
      correctAnswers: playerScore,
      questionsAnswered,
      durationSec: 0,
    });

    return () => srAnim.removeListener(listener);
  }, [
    addLoss,
    addMatch,
    addWin,
    addDraw,
    didWin,
    isDraw,
    heroPulse,
    opponentSRForResult,
    opponentIdForResult,
    opponentNameForResult,
    opponentTitleForResult,
    opponentStyleForResult,
    opponentScore,
    playerScore,
    questionsAnswered,
    rankedContext,
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
        shieldConsumed: integrityBreakdown?.shieldConsumed,
        promotionMatch: integrityBreakdown?.promotionMatch,
      }),
    [didWin, srBefore, srAfter, rankBefore, rankAfter, streakAfter, integrityBreakdown],
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
    : prestige.shieldConsumed
      ? "Your shield absorbed the demotion. The next match decides whether you stabilize."
      : prestige.oneWinAway
        ? "One win away. A clean match can unlock the next division."
        : prestige.promotionPressure
          ? "Promotion is close. One strong run can push you over the line."
          : prestige.demotionDanger
            ? "Demotion danger active. Your next win matters."
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ transform: [{ scale: heroPulse }] }}>
        <ImageBackground
          source={didWin || isDraw ? RANKED_VICTORY_HERO : RANKED_DEFEAT_HERO}
          resizeMode="cover"
          imageStyle={styles.heroImage}
          style={styles.hero}
        >
          <LinearGradient
            pointerEvents="none"
            colors={
              didWin || isDraw
                ? [
                    "rgba(3,8,18,0.08)",
                    "rgba(3,8,18,0.54)",
                    "rgba(3,8,18,0.90)",
                  ]
                : [
                    "rgba(32,6,12,0.12)",
                    "rgba(3,8,18,0.62)",
                    "rgba(3,8,18,0.92)",
                  ]
            }
            locations={[0, 0.48, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.eyebrow}>RANKED CEREMONY</Text>
          <Text style={styles.ceremonyIcon}>{ceremonyIcon}</Text>
          <Text style={styles.resultTitle}>{resultTitle}</Text>
          <Text style={styles.resultSubtitle}>{resultSubtitle}</Text>

          <View style={styles.badgeRow}>
            {prestige.promoted && (
              <Text style={styles.goldBadge}>PROMOTED</Text>
            )}
            {prestige.promotionMatch && !prestige.promoted && (
              <Text style={styles.goldBadge}>PROMOTION MATCH</Text>
            )}
            {prestige.oneWinAway && !prestige.promoted && (
              <Text style={styles.goldBadge}>ONE WIN AWAY</Text>
            )}
            {prestige.promotionPressure && !prestige.oneWinAway && (
              <Text style={styles.goldBadge}>PROMOTION NEAR</Text>
            )}
            {prestige.dangerZone && (
              <Text style={styles.redBadge}>DANGER ZONE</Text>
            )}
            {streakAfter >= 2 && (
              <Text style={styles.greenBadge}>{streakAfter} STREAK</Text>
            )}
            {integrityBreakdown?.perfectMatch && (
              <Text style={styles.cyanBadge}>PERFECT</Text>
            )}
            {integrityBreakdown?.closeMatch && !didWin && (
              <Text style={styles.cyanBadge}>CLOSE MATCH</Text>
            )}
            {integrityBreakdown?.shieldConsumed && (
              <Text style={styles.cyanBadge}>SHIELD USED</Text>
            )}
            {integrityBreakdown?.lowRankProtection && (
              <Text style={styles.cyanBadge}>LOSS PROTECTED</Text>
            )}
          </View>
        </ImageBackground>
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

      {integrityBreakdown ? (
        <View style={styles.integrityPanel}>
          <Text style={styles.panelEyebrow}>SR BREAKDOWN</Text>
          {integrityBreakdown.reasons.map((reason) => (
            <View key={`${reason.label}-${reason.sr}`} style={styles.reasonRow}>
              <Text style={styles.reasonLabel}>{reason.label}</Text>
              <Text
                style={[
                  styles.reasonDelta,
                  reason.tone === "bad"
                    ? styles.reasonBad
                    : reason.tone === "good"
                      ? styles.reasonGood
                      : styles.reasonNeutral,
                ]}
              >
                {reason.sr > 0
                  ? `+${reason.sr}`
                  : reason.sr < 0
                    ? reason.sr
                    : "0"}{" "}
                SR
              </Text>
            </View>
          ))}
        </View>
      ) : null}

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

      <View
        style={[
          styles.promotionPanel,
          prestige.promoted && styles.promotionPanelHot,
          prestige.shieldConsumed && styles.promotionPanelShield,
        ]}
      >
        <Text style={styles.panelEyebrow}>PROMOTION TRACK</Text>
        <Text style={styles.panelTitle}>{prestige.headline}</Text>
        {prestige.breakthroughLabel ? (
          <Text style={styles.breakthroughText}>{prestige.breakthroughLabel}</Text>
        ) : null}
        <Text style={styles.pressureText}>{prestige.subtext}</Text>
        <View style={styles.promotionMetaRow}>
          <Text style={styles.promotionMetaPill}>
            {prestige.oneWinAway
              ? "1 WIN AWAY"
              : prestige.promotionMatch
                ? "PROMOTION MATCH"
                : prestige.shieldActive
                  ? "SHIELD READY"
                  : "CLIMB ACTIVE"}
          </Text>
          {prestige.nextRankLabel ? (
            <Text style={styles.promotionMetaText}>Target: {prestige.nextRankLabel}</Text>
          ) : (
            <Text style={styles.promotionMetaText}>Elite ceiling reached</Text>
          )}
        </View>
      </View>

      <View style={styles.panelDark}>
        <Text style={styles.panelEyebrow}>PRESSURE REPORT</Text>
        <Text style={styles.panelTitle}>Rank Pressure</Text>
        <Text style={styles.pressureText}>{pressureMessage}</Text>
      </View>

      <View style={styles.seasonPanel}>
        <Text style={styles.panelEyebrow}>SEASON PRESTIGE</Text>
        <Text style={styles.panelTitle}>{seasonReward.title}</Text>
        <Text style={styles.pressureText}>
          Peak: {getRankLabel(highestRank)} • {highestSR} SR.{" "}
          {seasonReward.rewardLabel}
        </Text>
      </View>

      <View style={styles.dopaminePanel}>
        <Text style={styles.dopamineTitle}>
          {didWin
            ? "Momentum Rewarded"
            : isDraw
              ? "SR Protected"
              : "Recovery Challenge"}
        </Text>
        <Text style={styles.dopamineText}>
          {didWin
            ? "Ranked history, rewards, and season climb were updated."
            : isDraw
              ? "Draw recorded. Your climb was protected — run it back and take the edge."
              : "Your ranked history was updated. Return to the ladder and reclaim momentum."}
        </Text>
      </View>

      <View style={styles.dopaminePanel}>
        <Text style={styles.dopamineTitle}>Arena Reward</Text>
        <Text style={styles.dopamineText}>
          {didWin
            ? `You won +${rewardApplied.coins || rewardPreview.coins} coins and +${rewardApplied.arenaTokens || rewardPreview.arenaTokens} arena tokens.`
            : isDraw
              ? "No coins awarded on a draw. SR was protected so the match still matters."
              : "No coins awarded on a ranked loss. Entry cost was spent when you joined."}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.continueBtn,
          didWin || isDraw ? styles.continueWin : styles.continueLoss,
        ]}
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
    backgroundColor: "#071226",
  },
  content: {
    paddingTop: 28,
    paddingHorizontal: 12,
    paddingBottom: 56,
  },
  hero: {
    minHeight: 138,
    borderRadius: 20,
    padding: 11,
    overflow: "hidden",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(247,201,72,0.28)",
    alignItems: "center",
  },
  heroImage: {
    borderRadius: 20,
  },
  eyebrow: {
    color: "#F7C948",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.3,
  },
  ceremonyIcon: {
    fontSize: 20,
    marginTop: 5,
  },
  resultTitle: {
    color: "#FFFFFF",
    fontSize: 14,
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
  cyanBadge: {
    color: "#062033",
    backgroundColor: "#8FEAFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 9,
    fontWeight: "900",
  },
  scoreBox: {
    backgroundColor: "rgba(10,24,48,0.92)",
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
    fontSize: 19,
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
  seasonPanel: {
    marginTop: 8,
    padding: 10,
    borderRadius: 18,
    backgroundColor: "rgba(8,18,34,0.88)",
    borderWidth: 1,
    borderColor: "rgba(143,234,255,0.28)",
  },

  rewardPanel: {
    backgroundColor: "rgba(14,25,48,0.96)",
    borderRadius: 16,
    padding: 11,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(247,201,72,0.22)",
  },
  integrityPanel: {
    backgroundColor: "rgba(7,20,38,0.96)",
    borderRadius: 16,
    padding: 11,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(143,234,255,0.20)",
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 5,
  },
  reasonLabel: {
    color: "#D8E7FF",
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
  },
  reasonDelta: {
    fontSize: 11,
    fontWeight: "900",
  },
  reasonGood: {
    color: "#52D273",
  },
  reasonBad: {
    color: "#FF6B6B",
  },
  reasonNeutral: {
    color: "#BBD7FF",
  },
  panel: {
    backgroundColor: "rgba(10,24,48,0.92)",
    borderRadius: 16,
    padding: 11,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  panelDark: {
    backgroundColor: "rgba(8,18,35,0.96)",
    borderRadius: 16,
    padding: 11,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(247,201,72,0.18)",
  },
  promotionPanel: {
    backgroundColor: "rgba(9,23,43,0.96)",
    borderRadius: 16,
    padding: 11,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(143,234,255,0.20)",
  },
  promotionPanelHot: {
    borderColor: "rgba(247,201,72,0.42)",
    backgroundColor: "rgba(32,27,10,0.92)",
  },
  promotionPanelShield: {
    borderColor: "rgba(143,234,255,0.40)",
    backgroundColor: "rgba(9,30,48,0.94)",
  },
  breakthroughText: {
    color: "#F7C948",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 5,
  },
  promotionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    flexWrap: "wrap",
  },
  promotionMetaPill: {
    color: "#062033",
    backgroundColor: "#8FEAFF",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 9,
    fontWeight: "900",
  },
  promotionMetaText: {
    color: "#BBD7FF",
    fontSize: 10.5,
    fontWeight: "800",
  },
  dopaminePanel: {
    backgroundColor: "rgba(10,24,48,0.96)",
    borderRadius: 16,
    padding: 11,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(143,230,255,0.18)",
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
    fontSize: 19,
    fontWeight: "900",
  },
  srNow: {
    color: "#FFFFFF",
    fontSize: 15,
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
    paddingVertical: 12,
    borderRadius: 13,
    alignItems: "center",
  },
  continueWin: {
    backgroundColor: "#10233D",
    borderWidth: 1,
    borderColor: "#D6A84F",
  },
  continueLoss: {
    backgroundColor: "#2A1320",
    borderWidth: 1,
    borderColor: "#FF5D5D",
  },
  continueText: {
    color: "#F7D37A",
    fontSize: 14,
    fontWeight: "900",
  },
});



