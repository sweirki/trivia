// ClaimButton.tsx — Global Daily Reward Button (A+++++)

import React, { useRef } from "react";
import { TouchableOpacity, Text, StyleSheet, Animated } from "react-native";
import { useDailyRewardStore } from "@/store/useDailyRewardStore";

type ClaimButtonProps = {
  onClaimed?: () => void;
};

export default function ClaimButton({ onClaimed }: ClaimButtonProps) {

  const scale = useRef(new Animated.Value(1)).current;

  const canClaim = useDailyRewardStore((s) => s.canClaim);
  const claim = useDailyRewardStore((s) => s.claim);

  const disabled = !canClaim();

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();

  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

 const handlePress = () => {
  if (disabled) return;
  claim();
  onClaimed?.();
};


  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={disabled}
        onPressIn={!disabled ? pressIn : undefined}
        onPressOut={() => {
          if (disabled) return;
          pressOut();
          handlePress();
        }}
        style={[styles.button, disabled && styles.disabledButton]}
      >
        <Text style={[styles.text, disabled && styles.disabledText]}>
          {disabled ? "Already Claimed" : "Claim Reward"}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#FFD700",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  text: {
    color: "#000",
    fontSize: 20,
    fontWeight: "900",
  },
  disabledButton: {
    backgroundColor: "#444",
  },
  disabledText: {
    color: "#999",
  },
});
