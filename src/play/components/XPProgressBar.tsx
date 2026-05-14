import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useTheme } from "@/theme";

export default function XPProgressBar() {
  const theme = useTheme();

  const xp = usePlayerStore((s) => s.xp);
  const level = usePlayerStore((s) => s.level);

  // New XP curve function matches PlayerStore
  const xpRequiredForLevel = (lvl) => lvl * 150 + lvl * lvl * 6;
  const xpRequired = xpRequiredForLevel(level);

  const progress = xpRequired > 0 ? xp / xpRequired : 0;

  const anim = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: progress,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.backgroundSoft },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            width: anim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
            backgroundColor: theme.colors.gold,
            shadowColor: theme.colors.gold,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 14,
    width: "100%",
    borderRadius: 7,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 7,
  },
});




