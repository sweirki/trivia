// /app/play/game.tsx — A+++++ UPGRADE
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
} from "react-native";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import { useTournamentStore } from "@/arena/store/useTournamentStore";
import { useLocalSearchParams } from "expo-router";

import { useQuickGameStore } from "@/store/useQuickGameStore";
import { usePlayerStore } from "@/store/usePlayerStore";

export default function GameScreen() {
  const router = useRouter();
const resetGame = useQuickGameStore((s) => s.resetGame);
  const gameContext = useQuickGameStore((s) => s.gameContext);

  const submitMatchResult = useTournamentStore(
    (s) => s.submitMatchResult
  );
  
  const mode = useQuickGameStore((s) => s.mode);
  const idx = useQuickGameStore((s) => s.idx);
  const questions = useQuickGameStore((s) => s.questions);
  const score = useQuickGameStore((s) => s.score);
  const streak = useQuickGameStore((s) => s.streak);
  const timeLeft = useQuickGameStore((s) => s.timeLeft);
  const gameOver = useQuickGameStore((s) => s.gameOver);
  const handleAnswer = useQuickGameStore((s) => s.handleAnswer);
const { id: matchId } = useLocalSearchParams<{ id: string }>();
console.log("TOURNAMENT?", gameContext, "matchId=", matchId);

  const current = questions[idx];

  const vipTier = usePlayerStore((s) => s.vipTier);
  const boosts = usePlayerStore((s) => s.activeBoosts);

  const [locked, setLocked] = useState(false);

  const blockInput = () => {
    setLocked(true);
    setTimeout(() => setLocked(false), 450);
  };

  // ---------------------------------------------------------
  // SOUND REFS (SAFE)
  // ---------------------------------------------------------
  const correctSFX = useRef<Audio.Sound | null>(null);
  const wrongSFX = useRef<Audio.Sound | null>(null);
  const suddenSFX = useRef<Audio.Sound | null>(null);
  const startSFX = useRef<Audio.Sound | null>(null);

  async function loadSounds() {
    if (correctSFX.current) return;

    try {
      correctSFX.current = new Audio.Sound();
      wrongSFX.current = new Audio.Sound();
      suddenSFX.current = new Audio.Sound();
      startSFX.current = new Audio.Sound();

      await correctSFX.current.loadAsync(require("@assets/sounds/correct.mp3"));
      await wrongSFX.current.loadAsync(require("@assets/sounds/error.mp3"));
      await suddenSFX.current.loadAsync(require("@assets/sounds/round-end.mp3"));
      await startSFX.current.loadAsync(require("@assets/sounds/click.mp3"));

      await startSFX.current.playAsync();
    } catch {}
  }

  useEffect(() => {
    loadSounds();
  }, []);

  async function safePlay(ref) {
    try {
      if (!ref.current) return;
      const s = await ref.current.getStatusAsync();
      if (!s.isLoaded) return;
      await ref.current.replayAsync();
    } catch {}
  }


  // ---------------------------------------------------------
  // ANIMATIONS
  // ---------------------------------------------------------
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [idx]);

  const timerPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (mode === "timed60" || mode === "timed90") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(timerPulse, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(timerPulse, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, []);

  const lowTimePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (timeLeft <= 5 && (mode === "timed60" || mode === "timed90")) {
      Animated.sequence([
        Animated.timing(lowTimePulse, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(lowTimePulse, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [timeLeft]);

  // ---------------------------------------------------------
  // GAME OVER
  // ---------------------------------------------------------
 useEffect(() => {
  if (!gameOver) return;

  const t = setTimeout(() => {
   if (gameContext === "tournament" && matchId) {
 const latestScore = useQuickGameStore.getState().score;
const totalQ = useQuickGameStore.getState().questions.length || 10;

// TEMP bot score (until we tune properly)
const botScore = Math.max(
  0,
  Math.min(totalQ, latestScore + (Math.floor(Math.random() * 3) - 2)) // -2..0..+? small swing
);
submitMatchResult(matchId, latestScore, botScore);


}
 else {
      // Normal game flow
      router.replace("/(app)/play/(screens)/result");
    }
  }, 300);

  return () => clearTimeout(t);
}, [gameOver]);



 

  // ---------------------------------------------------------
  // SAFE ANSWER HANDLER — NEW A++++ logic
  // ---------------------------------------------------------
  const onAnswer = async (ans: string) => {
    if (locked || gameOver) return;

    blockInput();

    if (mode === "sudden" && ans !== current.correct) {
      Vibration.vibrate(80);
      await safePlay(suddenSFX);
    } else if (ans === current.correct) {
      await safePlay(correctSFX);
    } else {
      await safePlay(wrongSFX);
      Vibration.vibrate(60);
    }

    handleAnswer(ans);
  };

  // ---------------------------------------------------------
  // UI LAYER
  // ---------------------------------------------------------
  return (
    <View style={styles.container}>
  {!current ? (
    <View style={styles.center}>
      <Text style={styles.loading}>Loading…</Text>
    </View>
  ) : (
    <>
      <View style={styles.holoOverlay} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.score}>Score: {score}</Text>
        <Text style={styles.streak}>🔥 {streak}</Text>
        {vipTier > 0 && <Text style={styles.vipBadge}>VIP {vipTier}</Text>}
      </View>

      {(mode === "timed60" || mode === "timed90") && (
        <Animated.Text
          style={[
            styles.timer,
            { transform: [{ scale: timerPulse }, { scale: lowTimePulse }] },
            timeLeft <= 5 && { color: "#ff4d4d" },
          ]}
        >
          {timeLeft}s
        </Animated.Text>
      )}

      <Animated.Text style={[styles.question, { opacity: fadeAnim }]}>
        {current.text}
      </Animated.Text>

      <Animated.View style={{ opacity: fadeAnim }}>
        {current.answers.map((a: string, i: number) => (
          <TouchableOpacity
            key={i}
            onPress={() => onAnswer(a)}
            style={[
              styles.answerBtn,
              locked && { opacity: 0.65 },
              boosts.xp > 0 && { borderColor: "#FFD700" },
            ]}
          >
            <Text style={styles.answerText}>{a}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </>
  )}
</View>

  );
}

// ---------------------------------------------------------
// STYLES
// ---------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0518",
    paddingHorizontal: 18,
    justifyContent: "center",
  },

  holoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(120, 60, 255, 0.14)",
  },

  header: {
    position: "absolute",
    top: 48,
    left: 18,
    right: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  score: {
    color: "#7af0ff",
    fontSize: 18,
    fontWeight: "700",
  },

  streak: {
    color: "#ff67f7",
    fontSize: 18,
    fontWeight: "700",
  },

  vipBadge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },

  timer: {
    color: "#00eaff",
    fontSize: 42,
    textAlign: "center",
    marginVertical: 16,
    fontWeight: "800",
  },

  question: {
    fontSize: 23,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 26,
    paddingHorizontal: 8,
    fontWeight: "600",
    lineHeight: 30,
  },

  answerBtn: {
    backgroundColor: "#1b1036",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginBottom: 10,
    borderColor: "#7b4bff",
    borderWidth: 1.2,
  },

  answerText: {
    color: "#dcd3ff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
  },

  loading: {
    color: "white",
    fontSize: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

