// app/(app)/play/components/ComboBanner.tsx
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, Text } from "react-native";
import { useTheme } from "@/theme";

export default function ComboBanner({ streak }) {
  const theme = useTheme();

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (streak < 2) return;

    opacity.setValue(0);
    scale.setValue(0.8);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [streak]);

  if (streak < 2) return <View style={{ height: 40 }} />;

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          borderColor: theme.colors.gold,
          backgroundColor: "rgba(216,178,74,0.2)",
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <Text style={[styles.text, { color: theme.colors.gold }]}>
        🔥 {streak} Combo!
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#d8b24a",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  text: {
    fontSize: 18,
    fontWeight: "700",
  },
});


