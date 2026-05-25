import React, { useRef } from "react";
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { Text, useTheme } from "@/theme";
import { feedback } from "@/feedback";

type GoldButtonProps = {
  title: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export default function GoldButton({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}: GoldButtonProps) {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      friction: 7,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        activeOpacity={0.9}
        disabled={disabled}
        onPressIn={() => {
          if (!disabled) animateTo(0.97);
        }}
        onPressOut={() => {
          animateTo(1);
        }}
        onPress={() => {
          if (disabled) return;
          feedback.tap();
          onPress?.();
        }}
        style={[
          styles.btn,
          {
            backgroundColor: theme.colors.gold,
            shadowColor: theme.colors.gold,
            opacity: disabled ? 0.55 : 1,
          },
          style,
        ]}
      >
        <Text
          allowFontScaling
          maxFontSizeMultiplier={1.25}
          style={[styles.text, { color: theme.colors.background }, textStyle]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowRadius: 5,
    shadowOpacity: 0.16,
    elevation: 2,
  },
  text: {
    fontSize: 13,
    fontWeight: "800",
  },
});


