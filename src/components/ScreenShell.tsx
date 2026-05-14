import React, { ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/theme";

type ScreenShellProps = {
  children: ReactNode;
  testID?: string;
  accessibilityLabel?: string;
  scroll?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export default function ScreenShell({
  children,
  scroll = true,
  padded = true,
  style,
  contentStyle,
  testID,
  accessibilityLabel,
}: ScreenShellProps) {
  const theme = useTheme();

  const content = [
    styles.content,
    {
      paddingHorizontal: padded ? theme.spacing.md : 0,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing["3xl"],
    },
    contentStyle,
  ];

  return (
    <SafeAreaView
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.safeArea,
        { backgroundColor: theme.colors.background },
        style,
      ]}
    >
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews
          contentContainerStyle={content}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, content]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});

