import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { router } from "expo-router";

import { useTournamentStore } from "@/arena/store/useTournamentStore";

export default function TournamentSummary() {
  const tournament = useTournamentStore((s) => s.tournament);
  const bracket = useTournamentStore((s) => s.bracket);
  const lifecycle = useTournamentStore((s) => s.lifecycle);
  const resetTournament = useTournamentStore((s) => s.resetTournament);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasExitedRef = useRef(false);

  const isReady =
    !!tournament && !!bracket && lifecycle === "COMPLETED";

  // --------------------------------------------------
  // FADE IN
  // --------------------------------------------------
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [fadeAnim]);

  // --------------------------------------------------
  // DERIVED DATA (SAFE)
  // --------------------------------------------------
  let championUid = "—";
  let standings: string[] = [];

  if (isReady) {
    championUid = tournament!.winnerUid ?? "—";

    const allMatches = [
      ...bracket!.qualifiers,
      ...bracket!.semifinals,
      ...(bracket!.final ? [bracket!.final] : []),
    ];

    const winCount = new Map<string, number>();

    allMatches.forEach((m) => {
      if (m.playerAUid) {
        winCount.set(
          m.playerAUid,
          (winCount.get(m.playerAUid) ?? 0) +
            (m.winnerUid === m.playerAUid ? 1 : 0)
        );
      }
      if (m.playerBUid) {
        winCount.set(
          m.playerBUid,
          (winCount.get(m.playerBUid) ?? 0) +
            (m.winnerUid === m.playerBUid ? 1 : 0)
        );
      }
    });

    standings = Array.from(winCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([uid]) => uid);
  }

  // --------------------------------------------------
  // EXIT
  // --------------------------------------------------
  const handleExit = () => {
    if (hasExitedRef.current) return;
    hasExitedRef.current = true;

    resetTournament();
    router.replace("/(app)/arena_reset");
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
  return (
    <Animated.View
      style={[styles.container, { opacity: fadeAnim }]}
    >
      {!isReady ? (
        <Text style={styles.error}>
          Tournament summary unavailable.
        </Text>
      ) : (
        <>
          <Text style={styles.title}>
            🏆 Tournament Complete
          </Text>

          <View style={styles.championBox}>
            <Text style={styles.championLabel}>
              CHAMPION
            </Text>
            <Text style={styles.championName}>
              {championUid}
            </Text>
          </View>

          <View style={styles.standingsBox}>
            <Text style={styles.standingsTitle}>
              Final Standings
            </Text>

            {standings.length === 0 ? (
              <Text style={styles.error}>
                Standings unavailable.
              </Text>
            ) : (
              standings.map((uid, index) => (
                <View
                  key={`${uid}-${index}`}
                  style={styles.row}
                >
                  <Text
                    style={[
                      styles.position,
                      index === 0 && styles.gold,
                      index === 1 && styles.silver,
                      index === 2 && styles.bronze,
                    ]}
                  >
                    {index + 1}
                  </Text>
                  <Text style={styles.playerName}>
                    {uid}
                  </Text>
                </View>
              ))
            )}
          </View>

          <TouchableOpacity
            style={styles.exitBtn}
            onPress={handleExit}
          >
            <Text style={styles.exitText}>
              Return to Arena
            </Text>
          </TouchableOpacity>
        </>
      )}
    </Animated.View>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0e14",
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  error: {
    color: "#aaa",
    marginTop: 40,
    fontSize: 16,
  },

  title: {
    color: "#FFD54F",
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 30,
    textAlign: "center",
  },

  championBox: {
    backgroundColor: "#151521",
    width: "90%",
    paddingVertical: 26,
    paddingHorizontal: 20,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 30,
  },

  championLabel: {
    color: "#FFD54F",
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 6,
  },

  championName: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },

  standingsBox: {
    width: "90%",
    backgroundColor: "#11111b",
    padding: 20,
    borderRadius: 16,
    marginBottom: 40,
  },

  standingsTitle: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 16,
    textAlign: "center",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },

  position: {
    width: 32,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    color: "#aaa",
  },

  gold: { color: "#FFD54F" },
  silver: { color: "#B0BEC5" },
  bronze: { color: "#D7A86E" },

  playerName: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 12,
  },

  exitBtn: {
    backgroundColor: "#4FC3F7",
    paddingVertical: 16,
    paddingHorizontal: 44,
    borderRadius: 14,
  },

  exitText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "700",
  },
});

