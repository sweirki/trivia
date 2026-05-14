import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "@/theme";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function SectionHeader({
  title,
  subtitle,
  right,
  style,
}: SectionHeaderProps) {
  const theme = useTheme();

  return (
    <View accessible accessibilityRole="header" style={[styles.row, { marginBottom: theme.spacing.sm + 2 }, style]}>
      <View style={styles.textWrap}>
        <Text allowFontScaling maxFontSizeMultiplier={1.25} style={[theme.typography.h3, styles.title]}>{title}</Text>
        {!!subtitle && (
          <Text allowFontScaling maxFontSizeMultiplier={1.2} style={[theme.typography.small, styles.subtitle]}>
            {subtitle}
          </Text>
        )}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    letterSpacing: 0.1,
  },
  subtitle: {
    marginTop: 3,
  },
});

