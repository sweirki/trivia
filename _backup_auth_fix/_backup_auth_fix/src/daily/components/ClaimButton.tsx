// ClaimButton.tsx — Global Daily Reward Button (A+++++)

import React, { useRef } from "react";
import { TouchableOpacity, Text, StyleSheet, Animated } from "react-native";
import { usePlayerStore } from "@/store/usePlayerStore";
import { claimDailyReward } from "@/daily/dailyService";
import { evaluateDailyClaim } from "@/daily/dailyLogic";


type ClaimButtonProps = {
  onClaimed?: () => void;
};

export default function ClaimButton({ onClaimed }: ClaimButtonProps) {

  const scale = useRef(new Animated.Value(1)).current;

 
 const daily = usePlayerStore((s) => s.daily);

const today = new Date().toISOString().slice(0, 10);

const evaluation = evaluateDailyClaim(
  daily.lastClaimDate,
  today
);

const disabled = !evaluation.canClaim;

const handlePress = async () => {
  if (disabled) return;
  await claimDailyReward();
  onClaimed?.();
};



  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
  activeOpacity={0.85}
  disabled={disabled}
  onPressIn={() => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  }}
  onPressOut={() => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
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
