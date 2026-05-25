import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, Easing } from "react-native";
import { useTheme } from "@/theme";

export default function ConfettiView({ trigger = false }) {
  const theme = useTheme();

  const particles = Array.from({ length: 20 }).map(() => {
    return {
      x: new Animated.Value(Math.random() * 300 - 150),
      y: new Animated.Value(-50),
      opacity: new Animated.Value(0),
      rotate: new Animated.Value(0),
      delay: Math.random() * 600,
      size: Math.random() * 6 + 4,
    };
  });

  useEffect(() => {
    if (!trigger) return;

    particles.forEach((p) => {
      p.opacity.setValue(0);
      p.y.setValue(-50);
      p.rotate.setValue(0);

      Animated.sequence([
        Animated.delay(p.delay),
        Animated.parallel([
          Animated.timing(p.opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(p.y, {
            toValue: 420 + Math.random() * 40,
            duration: 2400 + Math.random() * 600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(p.rotate, {
            toValue: 360,
            duration: 2400,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(p.opacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [trigger]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            opacity: p.opacity,
            width: p.size,
            height: p.size * 3,
            backgroundColor: theme.colors.gold,
            borderRadius: 2,
            transform: [
              { translateX: p.x },
              { translateY: p.y },
              { rotate: p.rotate.interpolate({
                  inputRange: [0, 360],
                  outputRange: ["0deg", "360deg"],
                })
              },
            ],
          }}
        />
      ))}
    </View>
  );
}






