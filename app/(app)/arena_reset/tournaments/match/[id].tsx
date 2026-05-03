import React, { useMemo, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";

import { s } from "@/arena/theme/arenaSizing";
import { useTournamentStore } from "@/arena/store/useTournamentStore";
import { useQuickGameStore } from "@/store/useQuickGameStore";
import { TournamentMatch } from "@/arena/types/match";

export default function TournamentMatchScreen() {
  // --------------------------------------------------
  // ROUTE + REFS
  // --------------------------------------------------
  const { id } = useLocalSearchParams<{ id: string }>();
  const hasLaunchedRef = useRef(false);

  // --------------------------------------------------
  // STORES (ALL HOOKS ALWAYS RUN)
  // --------------------------------------------------
  const bracket = useTournamentStore((s) => s.bracket);
  const tournament = useTournamentStore((s) => s.tournament);
  const lifecycle = useTournamentStore((s) => s.lifecycle);
  const initTournamentGame = useQuickGameStore(
    (s) => s.initTournamentGame
  );

  // --------------------------------------------------
  // DERIVE MATCH (PURE)
  // --------------------------------------------------
  const match: TournamentMatch | null = useMemo(() => {
    if (!bracket || !id) return null;

    return (
      bracket.qualifiers.find((m) => m.id === id) ??
      bracket.semifinals.find((m) => m.id === id) ??
      (bracket.final?.id === id ? bracket.final : null)
    );
  }, [bracket, id]);

  // --------------------------------------------------
  // NAVIGATION SIDE EFFECTS (SAFE)
  // --------------------------------------------------
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

  // --------------------------------------------------
  // LAUNCH MATCH (ONCE)
  // --------------------------------------------------
  const handlePlayMatch = () => {
    if (hasLaunchedRef.current) return;
    hasLaunchedRef.current = true;

    // Tournament matches are fixed-length
    initTournamentGame("general", 10);

    router.push({
      pathname: "/(app)/play/game",
      params: { id: match?.id },
    } as any);
  };

  // --------------------------------------------------
  // RENDER GUARD (AFTER ALL HOOKS)
  // --------------------------------------------------
 const isReady = !!tournament && !!match;


  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
  <View style={styles.container}>
    {!isReady ? (
      <Text style={styles.error}>Match not available.</Text>
    ) : (
      <>
        <Text style={styles.title}>Tournament Match</Text>

        <View style={styles.card}>
          <Text style={styles.player}>{match.playerAUid}</Text>
          <Text style={styles.vs}>vs</Text>
          <Text style={styles.player}>{match.playerBUid}</Text>
        </View>

        <Text style={styles.note}>
          This match will launch a tournament trivia round.
        </Text>

        <TouchableOpacity style={styles.playBtn} onPress={handlePlayMatch}>
          <Text style={styles.playText}>Play Match</Text>
        </TouchableOpacity>
      </>
    )}
  </View>
);

}

// --------------------------------------------------
// STYLES
// --------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0e14",
    paddingTop: s(60),
    paddingHorizontal: s(20),
    alignItems: "center",
  },
  title: {
    color: "#FFD54F",
    fontSize: s(28),
    fontWeight: "900",
    marginBottom: s(40),
  },
  card: {
    backgroundColor: "#151521",
    width: "90%",
    padding: s(30),
    borderRadius: s(16),
    alignItems: "center",
    marginBottom: s(30),
  },
  player: {
    color: "#fff",
    fontSize: s(20),
    fontWeight: "700",
  },
  vs: {
    color: "#aaa",
    marginVertical: s(10),
  },
  note: {
    color: "#777",
    fontSize: s(14),
    marginBottom: s(30),
    textAlign: "center",
  },
  playBtn: {
    backgroundColor: "#66BB6A",
    width: "90%",
    paddingVertical: s(14),
    borderRadius: s(12),
  },
  playText: {
    color: "#000",
    textAlign: "center",
    fontSize: s(16),
    fontWeight: "800",
  },
  error: {
    color: "#fff",
    fontSize: s(18),
    marginTop: s(40),
  },
});

