import React, { useEffect, useRef, useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";

import { useTournamentStore } from "@/arena/store/useTournamentStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { TournamentMatch } from "@/arena/types/match";

// --------------------------------------------------
// FEEDBACK (SAFE)
// --------------------------------------------------
async function playFeedback(didWin: boolean) {
  try {
    await Haptics.notificationAsync(
      didWin
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );

    const sound = new Audio.Sound();
    await sound.loadAsync(
      didWin
        ? require("@assets/sounds/win.mp3")
        : require("@assets/sounds/lose.mp3")
    );
    await sound.playAsync();
  } catch {
    // Never crash on feedback
  }
}

export default function TournamentMatchResult() {
  // --------------------------------------------------
  // HOOKS (ALWAYS RUN)
  // --------------------------------------------------
  const router = useRouter();
  const hasContinuedRef = useRef(false);
  const feedbackPlayedRef = useRef(false);

  const bracket = useTournamentStore((s) => s.bracket);
  const tournament = useTournamentStore((s) => s.tournament);

  // NOTE: keep your existing uid shape (you used (s as any).uid)
  const rawUid = usePlayerStore((s) => (s as any).uid);

  const [showScore, setShowScore] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  // --------------------------------------------------
  // REVEAL SEQUENCE
  // --------------------------------------------------
  useEffect(() => {
    const t1 = setTimeout(() => setShowScore(true), 450);
    const t2 = setTimeout(() => setShowProgress(true), 900);
    const t3 = setTimeout(() => setShowCTA(true), 1350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // --------------------------------------------------
  // DERIVE MATCH (PURE + SAFE)
  // --------------------------------------------------
  const match: TournamentMatch | null = useMemo(() => {
    if (!bracket) return null;

    const all: TournamentMatch[] = [
      ...(bracket.qualifiers ?? []),
      ...(bracket.semifinals ?? []),
      ...(bracket.final ? [bracket.final] : []),
    ];

    const completed = all.filter((m) => Boolean(m?.completed));
    return completed.length ? completed[completed.length - 1] : null;
  }, [bracket]);

  // --------------------------------------------------
  // DERIVE PLAYER (SAFE)
  // --------------------------------------------------
  const playerUid = useMemo(() => {
    if (!match) return null;

    if (
      rawUid &&
      (rawUid === match.playerAUid || rawUid === match.playerBUid)
    ) {
      return rawUid;
    }

    // fallback: first player if exists (prevents crash)
    return tournament?.players?.[0]?.uid ?? null;
  }, [match, rawUid, tournament?.players]);

  const didWin = Boolean(match && playerUid && match.winnerUid === playerUid);
  const isFinal = tournament?.status === "completed";

  // --------------------------------------------------
  // FEEDBACK (ONCE)
  // --------------------------------------------------
  useEffect(() => {
    if (!match || !playerUid) return;
    if (feedbackPlayedRef.current) return;

    feedbackPlayedRef.current = true;
    playFeedback(didWin);
  }, [didWin, match, playerUid]);

  // --------------------------------------------------
  // NAVIGATION
  // --------------------------------------------------
  const handleContinue = () => {
    if (hasContinuedRef.current) return;
    hasContinuedRef.current = true;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    router.replace(
      isFinal
        ? "/(app)/arena_reset/tournaments/TournamentSummary"
        : "/(app)/arena_reset/tournaments/TournamentBracket"
    );
  };

  // --------------------------------------------------
  // RENDER GUARD (AFTER ALL HOOKS)
  // --------------------------------------------------
  if (!tournament || !match || !playerUid) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Match result unavailable</Text>
      </View>
    );
  }

  const youAreA = match.playerAUid === playerUid;
  const yourScore = youAreA ? match.scoreA : match.scoreB;
  const opponentScore = youAreA ? match.scoreB : match.scoreA;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.resultTitle,
          { color: didWin ? "#4CAF50" : "#E53935" },
        ]}
      >
        {didWin ? "Victory 🎉" : "Defeat"}
      </Text>

      <Text style={styles.contextText}>
        {didWin
          ? "You advance to the next round"
          : "You fought well in this match"}
      </Text>

      {showScore && (
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>
            {yourScore} : {opponentScore}
          </Text>
        </View>
      )}

      {showProgress && (
        <Text style={styles.secondary}>
          {didWin
            ? "Momentum gained — your progress has been recorded."
            : "Your placement and progress have been recorded."}
        </Text>
      )}

      {showCTA && (
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>
            {isFinal ? "View Tournament Summary" : "Continue Tournament"}
          </Text>
        </TouchableOpacity>
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
    padding: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultTitle: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  contextText: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 28,
  },
  scoreBox: {
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: 16,
    backgroundColor: "#1e1e2a",
    marginBottom: 24,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  secondary: {
    fontSize: 14,
    opacity: 0.75,
    marginBottom: 36,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#222",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

