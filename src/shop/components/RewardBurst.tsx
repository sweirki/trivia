// RewardBurst.tsx — A+++++ Reward Particle Animation
import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function RewardBurst({ trigger }) {
  const particles = [...Array(12)].map(() => ({
    x: useRef(new Animated.Value(width / 2)).current,
    y: useRef(new Animated.Value(300)).current,
    opacity: useRef(new Animated.Value(0)).current,
  }));

  useEffect(() => {
    if (!trigger) return;

    particles.forEach((p) => {
      p.x.setValue(width / 2);
      p.y.setValue(300);
      p.opacity.setValue(1);

      Animated.parallel([
        Animated.timing(p.x, {
          toValue: Math.random() * width,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(p.y, {
          toValue: Math.random() * 150,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(p.opacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [trigger]);

  return (
    <View style={StyleSheet.absoluteFill}>
      {particles.map((p, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              transform: [{ translateX: p.x }, { translateY: p.y }],
              opacity: p.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: "absolute",
    width: 10,
    height: 10,
    backgroundColor: "#FFD700",
    borderRadius: 5,
  },
});




