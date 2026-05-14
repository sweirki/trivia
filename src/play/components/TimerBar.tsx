import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useTheme } from "@/theme";

type Props = {
  progress: Animated.Value;
};

export default function TimerBar({ progress }: Props) {
  const theme = useTheme();

  // Always gold
  const barColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["#D8B24A", "#D8B24A"],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.bar,
          {
            width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
            backgroundColor: barColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 10,
    backgroundColor: "rgba(255,215,115,0.25)", // ghost gold
    borderRadius: 10,
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 10,
  },
});




