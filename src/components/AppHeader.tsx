import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Text, useTheme } from "@/theme";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function AppHeader({ title, subtitle, eyebrow, right, style }: AppHeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.root, style]}>
      <View style={styles.copy}>
        {eyebrow ? (
          <Text variant="caption" style={[styles.eyebrow, { color: theme.colors.goldSoft }]}>
            {eyebrow.toUpperCase()}
          </Text>
        ) : null}
        <Text variant="h1" style={styles.title}>{title}</Text>
        {subtitle ? (
          <Text variant="bodySmall" style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  copy: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    letterSpacing: 1.2,
    marginBottom: 4,
    fontWeight: "800",
  },
  title: {
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 4,
  },
  right: {
    marginTop: 2,
  },
});
