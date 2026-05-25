import React, { useRef, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";

import { claimDailyReward } from "@/daily/dailyService";
import { evaluateDailyClaim } from "@/daily/dailyLogic";
import { getDayKeyUTC } from "@/economy/economyRules";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Text, useTheme } from "@/theme";

type ClaimButtonProps = {
  disabled?: boolean;
  disabledLabel?: string;
  onClaimed?: (result: any) => void;
};

const withTimeout = <T,>(promise: Promise<T>, ms = 8000): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Daily claim timed out")), ms);
    }),
  ]);

export default function ClaimButton({
  disabled: externalDisabled = false,
  disabledLabel = "Loading...",
  onClaimed,
}: ClaimButtonProps) {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const [saving, setSaving] = useState(false);

  const daily = usePlayerStore((state) => state.daily);

  const today = getDayKeyUTC();
  const evaluation = evaluateDailyClaim(
    daily.lastClaimDate,
    today,
    daily.streak
  );

  const isDisabled = externalDisabled || saving || !evaluation.canClaim;

  const label = saving
    ? "Saving..."
    : externalDisabled
      ? disabledLabel
      : evaluation.canClaim
        ? "Claim Reward"
        : "Already Claimed";

  const resetScale = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = async () => {
    if (isDisabled) return;

    setSaving(true);

    try {
      const result = await withTimeout(claimDailyReward());
      onClaimed?.(result);
    } catch (error) {
      console.warn("[daily] Claim failed:", error);
      onClaimed?.({ success: false, reason: "CLAIM_FAILED" });
    } finally {
      setSaving(false);
      resetScale();
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        testID="daily-claim-button"
        accessibilityLabel={label}
        activeOpacity={0.85}
        disabled={isDisabled}
        onPressIn={() => {
          if (isDisabled) return;

          Animated.spring(scale, {
            toValue: 0.96,
            useNativeDriver: true,
          }).start();
        }}
        onPressOut={resetScale}
        onPress={() => {
          void handlePress();
        }}
        style={[
          styles.button,
          {
            backgroundColor: isDisabled
              ? theme.colors.surfaceSoft
              : theme.colors.gold,
            borderColor: isDisabled
              ? theme.colors.border
              : theme.colors.goldSoft,
            shadowColor: isDisabled
              ? theme.colors.border
              : theme.colors.gold,
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: isDisabled
                ? theme.colors.textMuted
                : theme.colors.background,
            },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 2,
  },
  text: {
    fontSize: 15,
    fontWeight: "900",
  },
});


