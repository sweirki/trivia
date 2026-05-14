import React from "react";
import { ActivityIndicator, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "@/theme";

type LoadingStateProps = {
  title?: string;
  message?: string;
  style?: StyleProp<ViewStyle>;
};

export default function LoadingState({
  title = "Loading",
  message,
  style,
}: LoadingStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.wrap, { padding: theme.spacing.xl }, style]}>
      <ActivityIndicator size="large" />
      <Text style={[theme.typography.h3, styles.title]}>{title}</Text>
      {!!message && (
        <Text style={[theme.typography.small, styles.message]}>{message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
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

