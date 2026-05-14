import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/theme";
import PrimaryButton from "./PrimaryButton";

type ErrorStateProps = {
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function ErrorState({
  title = "Something went wrong",
  message = "Please try again.",
  retryLabel = "Try again",
  onRetry,
  style,
}: ErrorStateProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          padding: theme.spacing.xl,
          borderRadius: theme.radius.lg,
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.error,
        },
        style,
      ]}
    >
      <Ionicons name="alert-circle-outline" size={34} color={theme.colors.error} />
      <Text style={[theme.typography.h3, styles.title]}>{title}</Text>
      <Text style={[theme.typography.small, styles.message]}>{message}</Text>
      {!!onRetry && (
        <PrimaryButton
          title={retryLabel}
          onPress={onRetry}
          size="sm"
          variant="danger"
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

