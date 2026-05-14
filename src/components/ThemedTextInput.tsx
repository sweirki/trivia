import React from "react";
import {
  StyleSheet,
  TextInput,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from "react-native";

import { useTheme } from "@/theme";

type ThemedTextInputProps = TextInputProps & {
  style?: StyleProp<TextStyle>;
};

export default function ThemedTextInput({ style, placeholderTextColor, ...props }: ThemedTextInputProps) {
  const theme = useTheme();

  return (
    <TextInput
      selectionColor={theme.colors.gold}
      cursorColor={theme.colors.gold}
      placeholderTextColor={placeholderTextColor ?? theme.colors.textSubtle}
      style={[
        styles.input,
        {
          backgroundColor: theme.colors.cardSoft,
          borderColor: theme.colors.border,
          color: theme.colors.text,
          borderRadius: theme.radius.lg,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.md,
          fontSize: theme.typography.body.fontSize ?? 15,
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    minHeight: 52,
  },
});
