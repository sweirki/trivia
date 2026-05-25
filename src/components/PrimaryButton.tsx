import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { feedback } from "@/feedback";
import { useTheme } from "@/theme";

type PrimaryButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type PrimaryButtonSize = "sm" | "md" | "lg";

type PrimaryButtonProps = {
  title?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  variant?: PrimaryButtonVariant;
  size?: PrimaryButtonSize;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
} & Omit<PressableProps, "onPress" | "style" | "disabled">;

export default function PrimaryButton({
  title = "Button",
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "md",
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  ...pressableProps
}: PrimaryButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const variantStyle = {
    primary: {
      backgroundColor: theme.colors.gold,
      borderColor: theme.colors.gold,
      textColor: "#0E1424",
    },
    secondary: {
      backgroundColor: theme.colors.cardSoft,
      borderColor: theme.colors.border,
      textColor: theme.colors.text,
    },
    ghost: {
      backgroundColor: theme.colors.transparent,
      borderColor: theme.colors.border,
      textColor: theme.colors.gold,
    },
    danger: {
      backgroundColor: theme.colors.error,
      borderColor: theme.colors.error,
      textColor: "#FFFFFF",
    },
  }[variant];

  const sizeStyle = {
    sm: {
      minHeight: 44,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.typography.small.fontSize ?? 13,
      lineHeight: theme.typography.small.lineHeight ?? 18,
      borderRadius: theme.radius.md,
    },
    md: {
      minHeight: 46,
      paddingVertical: theme.spacing.sm + 2,
      paddingHorizontal: theme.spacing.lg,
      fontSize: theme.typography.bodyStrong.fontSize ?? 16,
      lineHeight: theme.typography.bodyStrong.lineHeight ?? 22,
      borderRadius: theme.radius.md,
    },
    lg: {
      minHeight: 54,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      fontSize: theme.typography.h3.fontSize ?? 18,
      lineHeight: theme.typography.h3.lineHeight ?? 24,
      borderRadius: theme.radius.lg,
    },
  }[size];

  return (
    <Pressable
      {...pressableProps}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={() => {
        feedback.tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.button,
        {
          width: fullWidth ? "100%" : undefined,
          minHeight: sizeStyle.minHeight,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          borderRadius: sizeStyle.borderRadius,
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          opacity: isDisabled ? 0.55 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.985 : 1 }],
        },
        variant !== "ghost" && theme.shadows.sm,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.textColor} accessibilityLabel={`${title} loading`} />
      ) : (
        <Text
          allowFontScaling
          maxFontSizeMultiplier={1.25}
          style={[
            styles.text,
            {
              color: variantStyle.textColor,
              fontSize: sizeStyle.fontSize,
              lineHeight: sizeStyle.lineHeight,
              fontWeight: "800",
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    textAlign: "center",
    letterSpacing: 0.2,
  },
});



