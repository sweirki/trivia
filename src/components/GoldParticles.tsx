import React from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export default function GoldParticles() {
  const particles = Array.from({ length: 30 });

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((_, i) => {
        const size = Math.random() * 4 + 2;
        const left = Math.random() * width;
        const delay = Math.random() * 4000;
        const duration = 6000 + Math.random() * 6000;

        const translateY = new Animated.Value(height + 20);

        // Looping animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(translateY, {
              toValue: -20,
              duration,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: height + 20,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        ).start();

        return (
          <View
            key={i}
            style={[
              styles.particleWrapper,
              { left, width: size, height: size },
            ]}
          >
            <Animated.View
              style={[
                styles.particle,
                {
                  width: size,
                  height: size,
                  backgroundColor: "rgba(255,215,0,0.7)",
                  transform: [{ translateY }],
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width,
    height,
    overflow: "hidden",
  },
  particleWrapper: {
    position: "absolute",
  },
  particle: {
    position: "absolute",
    borderRadius: 10,
  },
});




