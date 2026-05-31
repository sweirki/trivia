import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { usePlayerStore } from "@/store/usePlayerStore";

export default function XPProgressBar() {
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
style={styles.container}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            width: anim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
            backgroundColor: "#F6C453",
            shadowColor: "#F6C453",
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
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(6,14,29,0.85)",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.16)",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});






