import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/theme";
import PrimaryButton from "./PrimaryButton";

type EmptyStateProps = {
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function EmptyState({
  title,
  message,
  icon = "sparkles-outline",
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          padding: theme.spacing.xl,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={34} color={theme.colors.gold} />
      <Text style={[theme.typography.h3, styles.title]}>{title}</Text>
      {!!message && (
        <Text style={[theme.typography.small, styles.message]}>{message}</Text>
      )}
      {!!actionLabel && !!onAction && (
        <PrimaryButton
          title={actionLabel}
          onPress={onAction}
          size="sm"
          variant="secondary"
          style={{ marginTop: theme.spacing.md }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    alignItems: "center",
  },
  title: {
    marginTop: 12,
    textAlign: "center",
  },
  message: {
    marginTop: 6,
    textAlign: "center",
  },
});



