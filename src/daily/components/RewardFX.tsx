// RewardFX.tsx — A+++++ Reward Animation Layer
// Combines Confetti + RewardBurst + Screen Flash

import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import ConfettiView from "./ConfettiView";
import RewardBurst from "../../shop/components/RewardBurst";

export default function RewardFX({ trigger }) {
  const flash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!trigger) return;

    // Screen flash
    flash.setValue(1);
    Animated.timing(flash, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [trigger]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Gold particle burst */}
      <RewardBurst trigger={trigger} />

      {/* Confetti celebration */}
      {trigger && <ConfettiView />}

      {/* White screen flash */}
      <Animated.View
        style={[
          styles.flash,
          {
            opacity: flash,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
});






