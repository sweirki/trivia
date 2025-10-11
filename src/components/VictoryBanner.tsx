// src/components/VictoryBanner.tsx
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { theme } from "../../src/lib/theme";

type Props = {
  text: string; // text to display, e.g. "🏆 Victory!"
};

export default function VictoryBanner({ text }: Props) {
  const slideY = useRef(new Animated.Value(-150)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide + fade in → pause → slide + fade out
    Animated.sequence([
      Animated.parallel([
        Animated.timing(slideY, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.delay(2000),
      Animated.parallel([
        Animated.timing(slideY, { toValue: -150, duration: 600, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          transform: [{ translateY: slideY }],
          opacity: fade,
        },
      ]}
    >
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 80,
    alignSelf: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 40,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 22,
  },
});
