import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from "react-native";

type AnimatedProgressBarProps = {
  percent: number;
  height?: number;
  fillColor?: string;
  trackColor?: string;
  borderColor?: string;
  glowColor?: string;
  style?: StyleProp<ViewStyle>;
};

export default function AnimatedProgressBar({
  percent,
  height = 10,
  fillColor = "#FFD36B",
  trackColor = "#2D3145",
  borderColor = "transparent",
  glowColor,
  style,
}: AnimatedProgressBarProps) {
  const safePercent = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0));
  const widthAnim = useRef(new Animated.Value(safePercent)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: safePercent,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [safePercent, widthAnim]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [glowAnim]);

  const width = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.12, 0.42],
  });

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: trackColor,
          borderColor,
          borderRadius: height,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            width,
            height,
            backgroundColor: fillColor,
            borderRadius: height,
            shadowColor: glowColor ?? fillColor,
            shadowOpacity,
            shadowRadius: height,
            elevation: 3,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
    borderWidth: 1,
  },
  fill: {
    minWidth: 2,
  },
});
