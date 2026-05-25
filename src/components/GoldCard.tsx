import React, { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { feedback } from "@/feedback";
import { useTheme } from "@/theme";

type GoldCardVariant =
  | "default"
  | "soft"
  | "premium"
  | "locked"
  | "success"
  | "danger";

type GoldCardPadding = "none" | "sm" | "md" | "lg";

type GoldCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  variant?: GoldCardVariant;
  padding?: GoldCardPadding;
  pressable?: boolean;
  disabled?: boolean;
  selected?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: PressableProps["accessibilityRole"];
} & Omit<PressableProps, "style" | "children" | "onPress" | "disabled">;

export default function GoldCard({
  children,
  style,
  contentStyle,
  variant = "default",
  padding = "md",
  pressable = false,
  disabled = false,
  selected = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  ...pressableProps
}: GoldCardProps) {
  const theme = useTheme();

  const paddingValue = {
    none: 0,
    sm: theme.spacing.sm,
    md: theme.spacing.md,
    lg: theme.spacing.lg,
  }[padding];

  const variantStyle = {
    default: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.gold,
    },
    soft: {
      backgroundColor: theme.colors.cardSoft,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.gold,
    },
    premium: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.gold,
      shadowColor: theme.colors.gold,
    },
    locked: {
      backgroundColor: theme.colors.surfaceSoft,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.border,
    },
    success: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.success,
      shadowColor: theme.colors.success,
    },
    danger: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.error,
      shadowColor: theme.colors.error,
    },
  }[variant];

  const baseStyle = [
    styles.card,
    {
      padding: paddingValue,
      borderRadius: theme.radius.lg,
      backgroundColor: variantStyle.backgroundColor,
      borderColor: selected ? theme.colors.gold : variantStyle.borderColor,
      shadowColor: variantStyle.shadowColor,
      opacity: disabled ? 0.55 : 1,
    },
    selected && {
      borderWidth: 1.5,
      shadowOpacity: 0.18,
      shadowRadius: 8,
    },
    theme.shadows.sm,
    style,
  ];

  if (pressable || onPress) {
    return (
      <Pressable
        {...pressableProps}
        accessibilityRole={accessibilityRole ?? "button"}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled, selected }}
        disabled={disabled}
        onPress={() => {
          feedback.tap();
          onPress?.();
        }}
        style={({ pressed }) => [
          baseStyle,
          pressed && !disabled && {
            transform: [{ scale: 0.985 }],
            opacity: 0.9,
          },
        ]}
      >
        <View style={contentStyle}>{children}</View>
      </Pressable>
    );
  }

  return (
    <View style={baseStyle}>
      <View style={contentStyle}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    shadowOpacity: 0.1,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
});



