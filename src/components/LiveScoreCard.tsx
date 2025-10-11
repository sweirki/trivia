import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { onValue, ref } from "firebase/database";
import { rtdb } from "../../src/lib/firebase";
import { theme } from "../../src/lib/theme";

type Props = { mode: string; matchId: string };

export default function LiveScoreCard({ mode, matchId }: Props) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const scale = new Animated.Value(1);

  useEffect(() => {
    const playersRef = ref(rtdb, `matches/${mode}/${matchId}/players`);
    const unsub = onValue(playersRef, (snap) => {
      const data = snap.val() || {};
      const newScores: Record<string, number> = {};
      Object.keys(data).forEach((uid) => (newScores[uid] = data[uid].score || 0));
      setScores(newScores);
      // pulse animation each score update
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.1, duration: 150, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    });
    return () => unsub();
  }, [mode, matchId]);

  return (
    <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
      {Object.entries(scores).map(([uid, score]) => (
        <View key={uid} style={styles.row}>
          <Text style={styles.name}>{uid.slice(0, 5)}…</Text>
          <Text style={styles.score}>{score} pts</Text>
        </View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    padding: 12,
    borderRadius: 16,
    width: 250,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 4,
  },
  name: { color: theme.colors.text },
  score: { color: theme.colors.accent, fontWeight: "bold" },
});
