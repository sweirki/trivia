import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Audio } from "expo-av";
import { theme } from "../../src/lib/theme";

type Props = {
  onComplete?: () => void;
};

export default function ArenaCountdown({ onComplete }: Props) {
  const [count, setCount] = useState(3);
  const scale = new Animated.Value(1);

  // 🔊 Load sounds
  const [tickSound, setTickSound] = useState<Audio.Sound | null>(null);
  const [endSound, setEndSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadSounds = async () => {
      const { sound: tick } = await Audio.Sound.createAsync(
        require("../../assets/sounds/tick.mp3")
      );
      const { sound: end } = await Audio.Sound.createAsync(
        require("../../assets/sounds/round-end.mp3")
      );
      if (mounted) {
        setTickSound(tick);
        setEndSound(end);
      }
    };
    loadSounds();
    return () => {
      mounted = false;
      tickSound?.unloadAsync();
      endSound?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (count > 0) {
      tickSound?.replayAsync();
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.5, duration: 300, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => setCount((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      endSound?.replayAsync();
      onComplete && onComplete();
    }
  }, [count]);

  if (count < 0) return null;

  return (
    <View style={styles.overlay}>
      <Animated.Text style={[styles.text, { transform: [{ scale }] }]}>
        {count === 0 ? "GO!" : count}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  text: {
    color: theme.colors.accent,
    fontSize: 96,
    fontWeight: "bold",
    textShadowColor: theme.colors.primary,
    textShadowRadius: 20,
  },
});
