// src/components/ProgressRestoredPopup.tsx
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { View, Text, useTheme } from "@/theme";

type Props = {
  visible: boolean;
};

export default function ProgressRestoredPopup({ visible }: Props) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // auto-hide after 1.5s
      const t = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }, 1500);

      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrapper,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.card}>
        <Text style={[styles.title, { color: "#000" }]}>
          Welcome back!
        </Text>
        <Text style={[styles.subtitle, { color: "#000" }]}>
          Your progress is synced.
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 70,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
  card: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: "#FFD775",
    shadowColor: "#FFD775",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});




