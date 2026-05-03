import React, { useMemo, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { s } from "@/arena/theme/arenaSizing";

import { useTournamentStore } from "@/arena/store/useTournamentStore";
import { TournamentMatch } from "@/arena/types/match";

export default function TournamentBracket() {
  const tournament = useTournamentStore((st) => st.tournament);
  const bracket = useTournamentStore((st) => st.bracket);
  const lifecycle = useTournamentStore((st) => st.lifecycle);

  // Local nav lock: prevents double-tap / double route pushes
  const hasNavigatedRef = useRef(false);

  // --------------------------------------------
  // GUARD: TOURNAMENT / BRACKET
  // --------------------------------------------
  

  // Phase A: tournament should feel frozen when completed
 const tournamentCompleted =
  lifecycle === "COMPLETED" || tournament?.status === "completed";

  // Helpful labels (keeps UI truthful without changing features)
  const tournamentTitle = useMemo(() => {
    if (tournamentCompleted) return "🏁 Tournament Completed";
    return "🏆 Tournament Bracket";
  }, [tournamentCompleted]);
if (!tournament || !bracket) {
    return (
      <View style={styles.container}>
        <Text style={styles.info}>Tournament not started.</Text>
      </View>
    );
  }
  // --------------------------------------------
  // MATCH RENDER (PHASE A SAFE)
  // --------------------------------------------
  const renderMatch = (match: TournamentMatch | undefined, label: string) => {
    if (!match) return null;

    // Fail-closed data safety
    const hasId = typeof match.id === "string" && match.id.length > 0;
    const hasA = typeof match.playerAUid === "string" && match.playerAUid.length > 0;
    const hasB = typeof match.playerBUid === "string" && match.playerBUid.length > 0;

    const completed = !!match.completed;
    const hasWinner = typeof match.winnerUid === "string" && match.winnerUid.length > 0;

    // Ready means: fully assigned + not completed + tournament not completed
    const ready = hasId && hasA && hasB && !completed && !tournamentCompleted;

    // Locked if participants not fully assigned OR id missing OR tournament completed
    const locked = !hasId || !hasA || !hasB || tournamentCompleted;

    const handlePress = () => {
      // Phase A: never allow illegal entry
      if (!ready) return;
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;

      router.push(`/(app)/arena_reset/tournaments/match/${match.id}` as any);
    };

    return (
      <View
        style={[
          styles.matchBox,
          ready && styles.matchActive,
          locked && styles.matchLocked,
        ]}
      >
        <Text style={styles.matchTitle}>{label}</Text>

        <Text style={styles.player}>{hasA ? match.playerAUid : "TBD"}</Text>
        <Text style={styles.vs}>vs</Text>
        <Text style={styles.player}>{hasB ? match.playerBUid : "TBD"}</Text>

        {/* Play button only if truly playable */}
        {ready && (
          <TouchableOpacity style={styles.playBtn} onPress={handlePress}>
            <Text style={styles.playText}>▶ Play Match</Text>
          </TouchableOpacity>
        )}

        {/* Completed winner display (truthful, non-guessing) */}
        {completed && hasWinner && (
          <Text style={styles.winner}>✓ Winner: {match.winnerUid}</Text>
        )}

        {/* Phase A clarity: show "Locked" reason when tournament is completed */}
        {tournamentCompleted && !completed && (
          <Text style={styles.infoSmall}>Tournament completed — match locked</Text>
        )}
      </View>
    );
  };

  // --------------------------------------------
  // RENDER
  // --------------------------------------------
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{tournamentTitle}</Text>

      {/* QUALIFIERS */}
      <Text style={styles.round}>Qualifiers</Text>
      {bracket.qualifiers.length === 0 ? (
        <Text style={styles.infoSmall}>TBD</Text>
      ) : (
        bracket.qualifiers.map((m, i) => (
          <View key={m.id ?? `q-${i}`}>{renderMatch(m, `Match ${i + 1}`)}</View>
        ))
      )}

      {/* SEMIFINALS */}
      <Text style={styles.round}>Semifinals</Text>
      {bracket.semifinals.length === 0 ? (
        <Text style={styles.infoSmall}>TBD</Text>
      ) : (
        bracket.semifinals.map((m, i) => (
          <View key={m.id ?? `s-${i}`}>{renderMatch(m, `Semifinal ${i + 1}`)}</View>
        ))
      )}

      {/* FINAL */}
      <Text style={styles.round}>Final</Text>
      {bracket.final ? (
        renderMatch(bracket.final, "Grand Final")
      ) : (
        <Text style={styles.infoSmall}>TBD</Text>
      )}

      {/* CHAMPION */}
      {tournamentCompleted && tournament.winnerUid ? (
        <View style={styles.championBox}>
          <Text style={styles.championTitle}>Tournament Champion</Text>
          <Text style={styles.championName}>🏆 {tournament.winnerUid}</Text>
        </View>
      ) : null}
    </View>
  );
}

// --------------------------------------------
// STYLES (UNCHANGED)
// --------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0e14",
    paddingTop: s(50),
    paddingHorizontal: s(20),
  },

  title: {
    color: "#FFD54F",
    fontSize: s(30),
    fontWeight: "900",
    textAlign: "center",
    marginBottom: s(25),
  },

  round: {
    color: "#4FC3F7",
    fontSize: s(18),
    marginTop: s(30),
    marginBottom: s(12),
    fontWeight: "700",
  },

  matchBox: {
    backgroundColor: "#151521",
    padding: s(16),
    borderRadius: s(14),
    marginBottom: s(14),
    borderWidth: 1,
    borderColor: "#1f1f2e",
  },

  matchActive: {
    borderColor: "#FFD54F",
    shadowColor: "#FFD54F",
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },

  matchLocked: {
    opacity: 0.5,
  },

  matchTitle: {
    color: "#aaa",
    fontSize: s(14),
    marginBottom: s(8),
    textAlign: "center",
  },

  player: {
    color: "#fff",
    fontSize: s(16),
    textAlign: "center",
  },

  vs: {
    color: "#888",
    textAlign: "center",
    marginVertical: s(4),
  },

  playBtn: {
    backgroundColor: "#FFD54F",
    marginTop: s(12),
    paddingVertical: s(10),
    borderRadius: s(10),
  },

  playText: {
    color: "#000",
    textAlign: "center",
    fontWeight: "800",
    fontSize: s(15),
  },

  winner: {
    color: "#66BB6A",
    textAlign: "center",
    marginTop: s(10),
    fontSize: s(14),
    fontWeight: "700",
  },

  championBox: {
    marginTop: s(45),
    alignItems: "center",
    paddingVertical: s(20),
    borderTopWidth: 1,
    borderColor: "#2a2a3d",
  },

  championTitle: {
    color: "#aaa",
    fontSize: s(16),
  },

  championName: {
    color: "#FFD54F",
    fontSize: s(28),
    fontWeight: "900",
    marginTop: s(6),
  },

  info: {
    color: "#fff",
    textAlign: "center",
    marginTop: s(40),
    fontSize: s(18),
  },

  infoSmall: {
    color: "#777",
    fontSize: s(14),
    marginBottom: s(10),
    marginLeft: s(6),
  },
});
