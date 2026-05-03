import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

export default function XPShine() {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: "rgba(255,215,0,0.6)",
        opacity,
      }}
    />
  );
}


