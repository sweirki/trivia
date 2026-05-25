import React, { useMemo, useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";

const tournamentEntryHero = require("../../../../assets/images/arena/tournaments/tournament_entry_hero.webp");
const tournamentBracketPanel = require("../../../../assets/images/arena/tournaments/tournament_bracket_panel.webp");
const tournamentFinalsHero = require("../../../../assets/images/arena/tournaments/tournament_finals_hero.webp");

import { router } from "expo-router";
import { s } from "@/arena/theme/arenaSizing";

import { useTournamentStore } from "@/arena/store/useTournamentStore";
import { TournamentMatch } from "@/arena/types/match";

export default function TournamentBracket() {
  const tournament = useTournamentStore((st) => st.tournament);
  const bracket = useTournamentStore((st) => st.bracket);
  const lifecycle = useTournamentStore((st) => st.lifecycle);

  const hasNavigatedRef = useRef(false);

  const tournamentCompleted =
    lifecycle === "COMPLETED" || tournament?.status === "completed";

  const tournamentTitle = useMemo(() => {
    if (tournamentCompleted) return "🏁 Championship Complete";
    return "🏆 Tournament Bracket";
  }, [tournamentCompleted]);

  if (!tournament || !bracket) {
    return (
      <View style={styles.container}>
        <Text style={styles.info}>Tournament not started.</Text>
      </View>
    );
  }

  const renderMatch = (
    match: TournamentMatch | undefined,
    label: string,
    stage: string
  ) => {
    if (!match) return null;

    const hasId = typeof match.id === "string" && match.id.length > 0;
    const hasA =
      typeof match.playerAUid === "string" &&
      match.playerAUid.length > 0;

    const hasB =
      typeof match.playerBUid === "string" &&
      match.playerBUid.length > 0;

    const completed = !!match.completed;

    const ready =
      hasId &&
      hasA &&
      hasB &&
      !completed &&
      !tournamentCompleted;

    const handlePress = () => {
      if (!ready) return;
      if (hasNavigatedRef.current) return;

      hasNavigatedRef.current = true;

      router.push(
        `/(app)/arena_reset/tournaments/match/${match.id}` as any
      );
    };

    return (
      <View
        style={[
          styles.matchCard,
          ready && styles.activeCard,
          completed && styles.completedCard,
        ]}
      >
        <View style={styles.matchHeader}>
          <Text style={styles.stageText}>{stage}</Text>
          <Text style={styles.matchLabel}>{label}</Text>
        </View>

        <View style={styles.playerRow}>
          <View style={styles.playerBox}>
            <Text style={styles.playerName}>
              {hasA ? match.playerAUid : "TBD"}
            </Text>
          </View>

          <View style={styles.vsPill}>
            <Text style={styles.vsText}>VS</Text>
          </View>

          <View style={styles.playerBox}>
            <Text style={styles.playerName}>
              {hasB ? match.playerBUid : "TBD"}
            </Text>
          </View>
        </View>

        {completed && match.winnerUid ? (
          <View style={styles.winnerBox}>
            <Text style={styles.winnerLabel}>ADVANCED</Text>
            <Text style={styles.winnerText}>
              🏆 {match.winnerUid}
            </Text>
          </View>
        ) : ready ? (
          <TouchableOpacity
            style={styles.playBtn}
            onPress={handlePress}
            activeOpacity={0.9}
          >
            <Text style={styles.playText}>Enter Match</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.lockedBox}>
            <Text style={styles.lockedText}>
              Waiting for bracket resolution
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground source={tournamentEntryHero} imageStyle={styles.heroImage} style={styles.hero}>
        <View style={styles.heroShade} />
        <Text style={styles.heroEyebrow}>LIVE TOURNAMENT</Text>

        <Text style={styles.title}>{tournamentTitle}</Text>

        <Text style={styles.subtitle}>
          Survive qualifiers. Advance through semifinals.
          Reach the grand final and claim the crown.
        </Text>

        <View style={styles.progressRow}>
          <View style={styles.progressPill}>
            <Text style={styles.progressPillText}>
              {bracket.qualifiers.length} Qualifiers
            </Text>
          </View>

          <View style={styles.progressPill}>
            <Text style={styles.progressPillText}>
              {bracket.semifinals.length} Semifinals
            </Text>
          </View>

          <View style={styles.progressPill}>
            <Text style={styles.progressPillText}>
              Final Active
            </Text>
          </View>
        </View>
      </ImageBackground>

      <Text style={styles.roundTitle}>QUALIFIERS</Text>

      {bracket.qualifiers.map((m, i) => (
        <View key={m.id ?? `q-${i}`}>
          {renderMatch(m, `Match ${i + 1}`, "Qualifier")}
        </View>
      ))}

      <View style={styles.connector} />

      <Text style={styles.roundTitle}>SEMIFINALS</Text>

      {bracket.semifinals.map((m, i) => (
        <View key={m.id ?? `s-${i}`}>
          {renderMatch(m, `Semifinal ${i + 1}`, "Semifinal")}
        </View>
      ))}

      <View style={styles.connector} />

      <Text style={styles.roundTitle}>GRAND FINAL</Text>

      {bracket.final ? (
        renderMatch(bracket.final, "Championship Match", "Grand Final")
      ) : (
        <View style={styles.finalLocked}>
          <Text style={styles.finalLockedText}>
            Final unlocks after semifinal completion
          </Text>
        </View>
      )}

      <ImageBackground source={tournamentFinalsHero} imageStyle={styles.championImage} style={styles.championSection}>
        <View style={styles.championShade} />
        <Text style={styles.championEyebrow}>TOURNAMENT DESTINATION</Text>

        <Text style={styles.championTitle}>
          👑 Champion Crown
        </Text>

        <Text style={styles.championBody}>
          Only one player leaves as tournament champion.
          Every round increases pressure, prestige, and reward value.
        </Text>

        {tournamentCompleted && tournament.winnerUid ? (
          <View style={styles.championWinnerBox}>
            <Text style={styles.championWinnerLabel}>
              TOURNAMENT WINNER
            </Text>

            <Text style={styles.championWinnerName}>
              🏆 {tournament.winnerUid}
            </Text>
          </View>
        ) : null}
      </ImageBackground>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050716",
  },

  content: {
    paddingTop: s(62),
    paddingBottom: s(40),
    paddingHorizontal: s(18),
  },

  hero: {
    overflow: "hidden",
    backgroundColor: "#121724",
    borderRadius: s(24),
    padding: s(22),
    borderWidth: 1,
    borderColor: "#3b3216",
    marginBottom: s(24),
  },

  heroImage: {
    borderRadius: s(24),
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 8, 20, 0.45)",
  },
  championImage: {
    borderRadius: s(26),
  },
  championShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 8, 20, 0.42)",
  },

  heroEyebrow: {
    color: "#D6A93A",
    fontSize: s(11),
    fontWeight: "900",
    letterSpacing: 1,
  },

  title: {
    color: "#fff",
    fontSize: s(32),
    fontWeight: "900",
    marginTop: s(8),
  },

  subtitle: {
    color: "#b7b4c8",
    fontSize: s(14),
    lineHeight: s(22),
    marginTop: s(10),
  },

  progressRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: s(8),
    marginTop: s(18),
  },

  progressPill: {
    backgroundColor: "#262638",
    borderRadius: s(999),
    paddingHorizontal: s(12),
    paddingVertical: s(8),
  },

  progressPillText: {
    color: "#D6A93A",
    fontSize: s(11),
    fontWeight: "800",
  },

  roundTitle: {
    color: "#6EC7F2",
    fontSize: s(20),
    fontWeight: "900",
    marginBottom: s(14),
    marginTop: s(8),
  },

  connector: {
    height: s(32),
    alignSelf: "center",
    width: 2,
    backgroundColor: "#35354d",
    marginVertical: s(8),
  },

  matchCard: {
    backgroundColor: "#121724",
    borderRadius: s(22),
    padding: s(18),
    marginBottom: s(16),
    borderWidth: 1,
    borderColor: "#232336",
  },

  activeCard: {
    borderColor: "#D6A93A",
  },

  completedCard: {
    borderColor: "#3D8B55",
  },

  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: s(16),
  },

  stageText: {
    color: "#D6A93A",
    fontSize: s(11),
    fontWeight: "900",
  },

  matchLabel: {
    color: "#9e9ab1",
    fontSize: s(12),
    fontWeight: "700",
  },

  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: s(16),
  },

  playerBox: {
    flex: 1,
    backgroundColor: "#1d1d2b",
    borderRadius: s(14),
    padding: s(14),
    alignItems: "center",
  },

  playerName: {
    color: "#fff",
    fontSize: s(14),
    fontWeight: "800",
  },

  vsPill: {
    marginHorizontal: s(10),
    backgroundColor: "#2B2415",
    borderRadius: s(999),
    paddingHorizontal: s(10),
    paddingVertical: s(6),
  },

  vsText: {
    color: "#D6A93A",
    fontSize: s(11),
    fontWeight: "900",
  },

  playBtn: {
    backgroundColor: "#D6A93A",
    borderWidth: 1,
    borderColor: "rgba(255,231,158,0.42)",
    paddingVertical: s(14),
    borderRadius: s(14),
  },

  playText: {
    color: "#0B1020",
    textAlign: "center",
    fontWeight: "900",
    fontSize: s(15),
  },

  lockedBox: {
    backgroundColor: "#1A1A24",
    borderRadius: s(12),
    paddingVertical: s(12),
  },

  lockedText: {
    color: "#7d7a8e",
    textAlign: "center",
    fontSize: s(12),
  },

  winnerBox: {
    backgroundColor: "#132117",
    borderRadius: s(14),
    padding: s(14),
    alignItems: "center",
  },

  winnerLabel: {
    color: "#67D587",
    fontSize: s(11),
    fontWeight: "900",
    marginBottom: s(6),
  },

  winnerText: {
    color: "#fff",
    fontSize: s(16),
    fontWeight: "900",
  },

  finalLocked: {
    backgroundColor: "#121724",
    borderRadius: s(18),
    padding: s(18),
    alignItems: "center",
  },

  finalLockedText: {
    color: "#8e8aa0",
    fontSize: s(13),
  },

  championSection: {
    overflow: "hidden",
    marginTop: s(28),
    backgroundColor: "#121724",
    borderRadius: s(26),
    padding: s(24),
    borderWidth: 1,
    borderColor: "#4B3A11",
  },

  championEyebrow: {
    color: "#D6A93A",
    fontSize: s(11),
    fontWeight: "900",
    letterSpacing: 1,
  },

  championTitle: {
    color: "#fff",
    fontSize: s(28),
    fontWeight: "900",
    marginTop: s(10),
  },

  championBody: {
    color: "#c8c4d8",
    fontSize: s(14),
    lineHeight: s(22),
    marginTop: s(10),
  },

  championWinnerBox: {
    backgroundColor: "#2B2415",
    borderRadius: s(18),
    padding: s(18),
    alignItems: "center",
    marginTop: s(18),
    borderWidth: 1,
    borderColor: "#D6A93A",
  },

  championWinnerLabel: {
    color: "#D6A93A",
    fontSize: s(11),
    fontWeight: "900",
    letterSpacing: 1,
  },

  championWinnerName: {
    color: "#fff",
    fontSize: s(24),
    fontWeight: "900",
    marginTop: s(10),
  },

  info: {
    color: "#fff",
    textAlign: "center",
    marginTop: s(40),
    fontSize: s(18),
  },
});



