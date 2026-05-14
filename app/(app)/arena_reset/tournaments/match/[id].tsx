import React, { useMemo, useRef, useEffect, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

import { s } from "@/arena/theme/arenaSizing";
import { useTournamentStore } from "@/arena/store/useTournamentStore";
import { useQuickGameStore } from "@/store/useQuickGameStore";
import { TournamentMatch } from "@/arena/types/match";

function getRoundLabel(match: TournamentMatch | null, bracket: any) {
  if (!match || !bracket) return "Tournament Match";
  if (bracket.final?.id === match.id) return "Grand Final";
  if (bracket.semifinals?.some((m: TournamentMatch) => m.id === match.id)) return "Semifinal";
  return "Qualifier";
}

function getRoundTone(round: string) {
  if (round === "Grand Final") {
    return {
      icon: "👑",
      liveTag: "GRAND FINAL",
      title: "CHAMPIONSHIP POINT",
      subtitle: "This is the crown match. Win now and become tournament champion.",
      accent: "#FFD54F",
      cardColor: "#211904",
      pressureTitle: "Finals Pressure",
      pressureCopy: "One round decides the champion. Every answer can become the tournament moment.",
      artLabel: "Crown Slot",
      buttonText: "Enter Grand Final",
      buttonSub: "Champion countdown begins",
    };
  }

  if (round === "Semifinal") {
    return {
      icon: "🔥",
      liveTag: "SEMIFINAL HEAT",
      title: "FINAL SPOT ON THE LINE",
      subtitle: "Survive this round and earn your place in the Grand Final.",
      accent: "#FF8A65",
      cardColor: "#23120E",
      pressureTitle: "Elimination Pressure",
      pressureCopy: "This is where weak runs collapse. Win clean and move one step from the crown.",
      artLabel: "Fire Cup Slot",
      buttonText: "Enter Semifinal",
      buttonSub: "Final spot countdown",
    };
  }

  return {
    icon: "🏆",
    liveTag: "QUALIFIER",
    title: "WIN TO ADVANCE",
    subtitle: "Start your run. Survive the bracket. Build prestige.",
    accent: "#4FC3F7",
    cardColor: "#0E1B24",
    pressureTitle: "Opening Round",
    pressureCopy: "Set the tone early. A strong qualifier gives the whole run momentum.",
    artLabel: "Cup Slot",
    buttonText: "Enter Match",
    buttonSub: "3…2…1 tournament start",
  };
}

function displayName(value?: string | null) {
  if (!value) return "TBD";
  if (value === "guest-player") return "You";
  if (value.length > 14) return `${value.slice(0, 6)}…${value.slice(-4)}`;
  return value;
}

export default function TournamentMatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const hasLaunchedRef = useRef(false);

  const bracket = useTournamentStore((st) => st.bracket);
  const tournament = useTournamentStore((st) => st.tournament);
  const lifecycle = useTournamentStore((st) => st.lifecycle);
  const initTournamentGame = useQuickGameStore((st) => st.initTournamentGame);

  const [countdown, setCountdown] = useState<number | null>(null);

  const match: TournamentMatch | null = useMemo(() => {
    if (!bracket || !id) return null;

    return (
      bracket.qualifiers.find((m) => m.id === id) ??
      bracket.semifinals.find((m) => m.id === id) ??
      (bracket.final?.id === id ? bracket.final : null)
    );
  }, [bracket, id]);

  const roundLabel = useMemo(() => getRoundLabel(match, bracket), [match, bracket]);
  const tone = useMemo(() => getRoundTone(roundLabel), [roundLabel]);
  const isFinal = roundLabel === "Grand Final";

  useEffect(() => {
    if (!match) return;

    if (lifecycle === "COMPLETED") {
      router.replace("/(app)/arena_reset/tournaments/TournamentSummary");
      return;
    }

    if (match.completed) {
      router.replace("/(app)/arena_reset/tournaments/TournamentMatchResult");
    }
  }, [lifecycle, match]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown <= 0) {
      if (hasLaunchedRef.current) return;
      hasLaunchedRef.current = true;

      initTournamentGame("general", tournament?.config.questionsPerMatch ?? 10);
      router.push({
        pathname: "/(app)/play/game",
        params: { id: match?.id },
      } as any);
      return;
    }

    const timer = setTimeout(
      () => setCountdown((value) => (value === null ? null : value - 1)),
      1000
    );

    return () => clearTimeout(timer);
  }, [countdown, initTournamentGame, match?.id, tournament?.config.questionsPerMatch]);

  const handleStartCountdown = () => {
    if (!match || hasLaunchedRef.current) return;
    setCountdown(3);
  };

  if (!tournament || !match) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Match not available.</Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()} activeOpacity={0.72}>
          <Text style={styles.secondaryText}>Back to Tournament</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View
        style={[
          styles.hero,
          {
            borderColor: tone.accent,
            backgroundColor: tone.cardColor,
          },
        ]}
      >
        <Text style={[styles.liveTag, { color: tone.accent }]}>{tone.liveTag}</Text>
        <Text style={styles.round}>{roundLabel}</Text>
        <Text style={[styles.heroTitle, { color: tone.accent }]}>{tone.title}</Text>
        <Text style={styles.heroSub}>{tone.subtitle}</Text>

        {isFinal ? (
          <View style={styles.finalBadge}>
            <Text style={styles.finalBadgeText}>👑 CHAMPION WILL BE CROWNED</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.assetRow}>
        <View style={[styles.assetSlot, { borderColor: tone.accent }]}>
          <Text style={styles.assetIcon}>{tone.icon}</Text>
          <Text style={styles.assetLabel}>{tone.artLabel}</Text>
        </View>

        <View style={[styles.rewardSlot, isFinal && styles.finalRewardSlot]}>
          <Text style={styles.rewardIcon}>{isFinal ? "💎" : "🎁"}</Text>
          <Text style={styles.rewardTitle}>{tournament.config.rewardCoins} Coins</Text>
          <Text style={styles.rewardSub}>
            {isFinal ? "Champion reward pool" : "Prestige reward pool"}
          </Text>
        </View>
      </View>

      <View style={styles.vsCard}>
        <View style={styles.playerBox}>
          <Text style={styles.avatar}>🙂</Text>
          <Text style={styles.playerName}>{displayName(match.playerAUid)}</Text>
        </View>

        <View style={styles.vsCenter}>
          <Text style={[styles.vs, { color: tone.accent }]}>VS</Text>
          <Text style={styles.stakes}>{isFinal ? "Crown match" : "Win to advance"}</Text>
        </View>

        <View style={styles.playerBox}>
          <Text style={styles.avatar}>🤖</Text>
          <Text style={styles.playerName}>{displayName(match.playerBUid)}</Text>
        </View>
      </View>

      <View style={[styles.pressureCard, { borderColor: tone.accent }]}>
        <Text style={[styles.pressureTitle, { color: tone.accent }]}>
          {tone.pressureTitle}
        </Text>
        <Text style={styles.pressureText}>{tone.pressureCopy}</Text>
      </View>

      <View style={styles.rulesCard}>
        <Text style={styles.rulesTitle}>Match Stakes</Text>
        <Text style={styles.rule}>• {tournament.config.questionsPerMatch} questions</Text>
        <Text style={styles.rule}>• {tournament.config.timePerQuestion}s pressure per question</Text>
        <Text style={styles.rule}>• Winner advances through the bracket</Text>
        <Text style={styles.rule}>
          • {isFinal ? "Winner becomes tournament champion" : "Finals build future champion prestige"}
        </Text>
      </View>

      {countdown !== null ? (
        <View style={[styles.countdownCard, { borderColor: tone.accent }]}>
          <Text style={[styles.countdownText, { color: tone.accent }]}>
            {countdown === 0 ? "GO" : countdown}
          </Text>
          <Text style={styles.countdownSub}>
            {isFinal ? "The crown is on the line" : "Prepare for the round"}
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.playBtn, { backgroundColor: tone.accent }]}
          onPress={handleStartCountdown}
          activeOpacity={0.9}
        >
          <Text style={styles.playText}>{tone.buttonText}</Text>
          <Text style={styles.playSub}>{tone.buttonSub}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050512",
  },
  content: {
    paddingTop: s(44),
    paddingHorizontal: s(18),
    paddingBottom: s(132),
  },
  hero: {
    borderWidth: 1.5,
    borderRadius: s(24),
    padding: s(20),
    marginBottom: s(16),
  },
  liveTag: {
    fontSize: s(11),
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: s(8),
  },
  round: {
    color: "#FFFFFF",
    fontSize: s(30),
    fontWeight: "900",
    marginBottom: s(6),
  },
  heroTitle: {
    fontSize: s(16),
    fontWeight: "900",
  },
  heroSub: {
    color: "#D4D2E2",
    fontSize: s(13),
    lineHeight: s(19),
    marginTop: s(6),
  },
  finalBadge: {
    marginTop: s(14),
    backgroundColor: "#2B2415",
    borderWidth: 1,
    borderColor: "#FFD54F",
    borderRadius: s(999),
    paddingVertical: s(8),
    alignItems: "center",
  },
  finalBadgeText: {
    color: "#FFD54F",
    fontSize: s(11),
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  assetRow: {
    flexDirection: "row",
    gap: s(12),
    marginBottom: s(14),
  },
  assetSlot: {
    flex: 1,
    minHeight: s(96),
    backgroundColor: "#111122",
    borderWidth: 1,
    borderRadius: s(18),
    alignItems: "center",
    justifyContent: "center",
    padding: s(12),
  },
  assetIcon: {
    fontSize: s(38),
    marginBottom: s(8),
  },
  assetLabel: {
    color: "#9B9BAD",
    fontSize: s(11),
    fontWeight: "800",
  },
  rewardSlot: {
    flex: 1,
    minHeight: s(96),
    backgroundColor: "#201A04",
    borderWidth: 1,
    borderColor: "#5C4700",
    borderRadius: s(18),
    alignItems: "center",
    justifyContent: "center",
    padding: s(12),
  },
  finalRewardSlot: {
    borderColor: "#FFD54F",
    backgroundColor: "#2B2107",
  },
  rewardIcon: {
    fontSize: s(30),
    marginBottom: s(6),
  },
  rewardTitle: {
    color: "#FFD54F",
    fontSize: s(18),
    fontWeight: "900",
  },
  rewardSub: {
    color: "#CFC39A",
    fontSize: s(11),
    textAlign: "center",
  },
  vsCard: {
    backgroundColor: "#151527",
    borderRadius: s(22),
    padding: s(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: s(14),
    borderWidth: 1,
    borderColor: "#27273B",
  },
  playerBox: {
    flex: 1,
    alignItems: "center",
  },
  avatar: {
    fontSize: s(30),
    marginBottom: s(8),
  },
  playerName: {
    color: "#FFFFFF",
    fontSize: s(12),
    fontWeight: "800",
    textAlign: "center",
  },
  vsCenter: {
    width: s(92),
    alignItems: "center",
  },
  vs: {
    fontSize: s(22),
    fontWeight: "900",
  },
  stakes: {
    color: "#9B9BAD",
    fontSize: s(10),
    textAlign: "center",
    marginTop: s(4),
  },
  pressureCard: {
    backgroundColor: "#151527",
    borderRadius: s(18),
    padding: s(16),
    marginBottom: s(14),
    borderWidth: 1,
  },
  pressureTitle: {
    fontSize: s(16),
    fontWeight: "900",
    marginBottom: s(8),
  },
  pressureText: {
    color: "#D4D2E2",
    fontSize: s(13),
    lineHeight: s(20),
  },
  rulesCard: {
    backgroundColor: "#151527",
    borderRadius: s(18),
    padding: s(16),
    marginBottom: s(18),
  },
  rulesTitle: {
    color: "#FFFFFF",
    fontSize: s(16),
    fontWeight: "900",
    marginBottom: s(10),
  },
  rule: {
    color: "#B8B8CA",
    fontSize: s(12),
    lineHeight: s(20),
  },
  playBtn: {
    borderRadius: s(16),
    paddingVertical: s(13),
    alignItems: "center",
    marginBottom: s(10),
  },
  playText: {
    color: "#050512",
    fontSize: s(17),
    fontWeight: "900",
  },
  playSub: {
    color: "#2B2200",
    fontSize: s(10),
    fontWeight: "800",
    marginTop: s(3),
  },
  countdownCard: {
    backgroundColor: "#151527",
    borderWidth: 1.5,
    borderRadius: s(22),
    paddingVertical: s(18),
    alignItems: "center",
  },
  countdownText: {
    fontSize: s(52),
    fontWeight: "900",
  },
  countdownSub: {
    color: "#B8B8CA",
    fontSize: s(12),
    fontWeight: "800",
  },
  secondaryButton: {
    marginTop: s(20),
    backgroundColor: "#FFD54F",
    borderRadius: s(14),
    paddingVertical: s(14),
    paddingHorizontal: s(20),
  },
  secondaryText: {
    color: "#050512",
    fontWeight: "900",
  },
  error: {
    color: "#FFFFFF",
    fontSize: s(18),
    marginTop: s(40),
    textAlign: "center",
  },
});

