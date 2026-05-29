import React, { useEffect, useMemo, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const PARTICLE_COUNT = 30;

type Particle = {
  id: number;
  size: number;
  left: number;
  delay: number;
  duration: number;
  translateY: Animated.Value;
};

export default function GoldParticles() {
  const loopsRef = useRef<Animated.CompositeAnimation[]>([]);

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, id) => ({
        id,
        size: Math.random() * 4 + 2,
        left: Math.random() * width,
        delay: Math.random() * 4000,
        duration: 6000 + Math.random() * 6000,
        translateY: new Animated.Value(height + 20),
      })),
    []
  );

  useEffect(() => {
    loopsRef.current = particles.map((particle) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(particle.translateY, {
            toValue: -20,
            duration: particle.duration,
            delay: particle.delay,
            useNativeDriver: true,
          }),
          Animated.timing(particle.translateY, {
            toValue: height + 20,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

      loop.start();
      return loop;
    });

    return () => {
      loopsRef.current.forEach((loop) => loop.stop());
      loopsRef.current = [];
    };
  }, [particles]);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((particle) => (
        <View
          key={particle.id}
          style={[
            styles.particleWrapper,
            { left: particle.left, width: particle.size, height: particle.size },
          ]}
        >
          <Animated.View
            style={[
              styles.particle,
              {
                width: particle.size,
                height: particle.size,
                backgroundColor: "rgba(255,215,0,0.7)",
                transform: [{ translateY: particle.translateY }],
              },
            ]}
          />
        </View>
      ))}
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
    borderRadius: 999,
  },
});
