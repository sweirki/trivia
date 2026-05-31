import React, { useMemo, useRef, useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";

const tournamentLobbyHero = require("../../../../../assets/images/arena/tournaments/tournament_lobby_hero.webp");
const tournamentBracketPanel = require("../../../../../assets/images/arena/tournaments/tournament_bracket_panel.webp");
const tournamentFinalsHero = require("../../../../../assets/images/arena/tournaments/tournament_finals_hero.webp");

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
      accent: "#D6A93A",
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
    subtitle: "Start your run. Survive the path. Build prestige.",
    accent: "#6EC7F2",
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

function getTournamentPlayerName(tournament: any, uid?: string | null) {
  if (!uid) return "TBD";

  const player = tournament?.players?.find((p: any) => p.uid === uid);
  const name = player?.username?.trim?.();

  if (name && !/bot/i.test(name)) return name;
  if (uid.startsWith("bot-")) return "Arena Rival";
  if (uid.length > 14) return "Player";

  return displayName(uid);
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
  const heroArt = isFinal ? tournamentFinalsHero : tournamentLobbyHero;

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

      initTournamentGame("general", Math.min(tournament?.config.questionsPerMatch ?? 5, 5));
      router.push({
        pathname: "/(app)/play/game",
        params: { id: match?.id },
      } as any);
      return;
    }

    const timer = setTimeout(
      () => setCountdown((value) => (value === null ? null : value - 1)),
      350
    );

    return () => clearTimeout(timer);
  }, [countdown, initTournamentGame, match?.id, tournament?.config.questionsPerMatch]);

  const handleStartCountdown = () => {
    if (!match || hasLaunchedRef.current) return;
    setCountdown(1);
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
      <ImageBackground
        source={heroArt}
        imageStyle={styles.heroImage}
        style={[
          styles.hero,
          {
            borderColor: tone.accent,
            backgroundColor: tone.cardColor,
          },
        ]}
      >
        <View style={styles.heroShade} />
        <Text style={[styles.liveTag, { color: tone.accent }]}>{tone.liveTag}</Text>
        <Text style={styles.round}>{roundLabel}</Text>
        <Text style={[styles.heroTitle, { color: tone.accent }]}>{tone.title}</Text>
        <Text style={styles.heroSub}>{tone.subtitle}</Text>

        {isFinal ? (
          <View style={styles.finalBadge}>
            <Text style={styles.finalBadgeText}>👑 CHAMPION WILL BE CROWNED</Text>
          </View>
        ) : null}
      </ImageBackground>

      <View style={styles.assetRow}>
        <ImageBackground
          source={tournamentBracketPanel}
          imageStyle={styles.assetImage}
          style={[styles.assetSlot, { borderColor: tone.accent }]}
        >
          <View style={styles.assetShade} />
          <Text style={styles.assetIcon}>{tone.icon}</Text>
          <Text style={styles.assetLabel}>{tone.artLabel}</Text>
        </ImageBackground>

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
          <Text style={styles.avatar}>⚔️</Text>
          <Text style={styles.playerName}>{getTournamentPlayerName(tournament, match.playerAUid)}</Text>
        </View>

        <View style={styles.vsCenter}>
          <Text style={[styles.vs, { color: tone.accent }]}>VS</Text>
          <Text style={styles.stakes}>{isFinal ? "Crown match" : "Win to advance"}</Text>
        </View>

        <View style={styles.playerBox}>
          <Text style={styles.avatar}>⚔️</Text>
          <Text style={styles.playerName}>{getTournamentPlayerName(tournament, match.playerBUid)}</Text>
        </View>
      </View>

      <ImageBackground
        source={tournamentBracketPanel}
        imageStyle={styles.pressureImage}
        style={[styles.pressureCard, { borderColor: tone.accent }]}
      >
        <View style={styles.pressureShade} />
        <Text style={[styles.pressureTitle, { color: tone.accent }]}>
          {tone.pressureTitle}
        </Text>
        <Text style={styles.pressureText}>{tone.pressureCopy}</Text>
      </ImageBackground>

      <View style={styles.rulesCard}>
        <Text style={styles.rulesTitle}>Match Stakes</Text>
        <Text style={styles.rule}>• {tournament.config.questionsPerMatch} questions</Text>
        <Text style={styles.rule}>• {tournament.config.timePerQuestion}s pressure per question</Text>
        <Text style={styles.rule}>• Winner advances along the Champion Path</Text>
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
          style={[styles.playBtn, { backgroundColor: "#2F8FC6" }]}
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
    backgroundColor: "#050716",
  },
  content: {
    paddingTop: s(76),
    paddingHorizontal: s(18),
    paddingBottom: s(132),
  },
  hero: {
    overflow: "hidden",
    borderWidth: 1.5,
    borderRadius: s(24),
    padding: s(20),
    marginBottom: s(16),
  },
  heroImage: {
    borderRadius: s(24),
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 8, 20, 0.45)",
  },
  assetImage: {
    borderRadius: s(18),
  },
  assetShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 10, 22, 0.38)",
  },
  pressureImage: {
    borderRadius: s(18),
  },
  pressureShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 10, 22, 0.50)",
  },

  liveTag: {
    fontSize: s(14),
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
    fontSize: s(18),
    fontWeight: "900",
  },
  heroSub: {
    color: "#D4D2E2",
    fontSize: s(14),
    lineHeight: s(19),
    marginTop: s(6),
  },
  finalBadge: {
    marginTop: s(14),
    backgroundColor: "#241C0E",
    borderWidth: 1,
    borderColor: "#D6A93A",
    borderRadius: s(999),
    paddingVertical: s(8),
    alignItems: "center",
  },
  finalBadgeText: {
    color: "#D6A93A",
    fontSize: s(14),
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  assetRow: {
    flexDirection: "row",
    gap: s(12),
    marginBottom: s(14),
  },
  assetSlot: {
    overflow: "hidden",
    flex: 1,
    minHeight: s(96),
    backgroundColor: "#121724",
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
    fontSize: s(14),
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
    borderColor: "#D6A93A",
    backgroundColor: "#241C0E",
  },
  rewardIcon: {
    fontSize: s(30),
    marginBottom: s(6),
  },
  rewardTitle: {
    color: "#D6A93A",
    fontSize: s(18),
    fontWeight: "900",
  },
  rewardSub: {
    color: "#CFC39A",
    fontSize: s(14),
    textAlign: "center",
  },
  vsCard: {
    backgroundColor: "#121724",
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
    fontSize: s(14),
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
    fontSize: s(11),
    textAlign: "center",
    marginTop: s(4),
  },
  pressureCard: {
    overflow: "hidden",
    backgroundColor: "#121724",
    borderRadius: s(18),
    padding: s(16),
    marginBottom: s(14),
    borderWidth: 1,
  },
  pressureTitle: {
    fontSize: s(18),
    fontWeight: "900",
    marginBottom: s(8),
  },
  pressureText: {
    color: "#D4D2E2",
    fontSize: s(14),
    lineHeight: s(20),
  },
  rulesCard: {
    backgroundColor: "#121724",
    borderRadius: s(18),
    padding: s(16),
    marginBottom: s(18),
  },
  rulesTitle: {
    color: "#FFFFFF",
    fontSize: s(18),
    fontWeight: "900",
    marginBottom: s(10),
  },
  rule: {
    color: "#B8B8CA",
    fontSize: s(14),
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
    fontSize: s(18),
    fontWeight: "900",
  },
  playSub: {
    color: "#2B2200",
    fontSize: s(11),
    fontWeight: "800",
    marginTop: s(3),
  },
  countdownCard: {
    backgroundColor: "#121724",
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
    fontSize: s(14),
    fontWeight: "800",
  },
  secondaryButton: {
    marginTop: s(20),
    backgroundColor: "#2F8FC6",
    borderWidth: 1,
    borderColor: "rgba(143,216,255,0.50)",
    borderRadius: s(14),
    paddingVertical: s(14),
    paddingHorizontal: s(18),
  },
  secondaryText: {
    color: "#04111E",
    fontWeight: "900",
  },
  error: {
    color: "#FFFFFF",
    fontSize: s(18),
    marginTop: s(40),
    textAlign: "center",
  },
});



