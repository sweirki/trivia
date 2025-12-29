import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

export default function PrimaryButton({
  title = "Button",
  onPress,
  style,
}: {
  title?: string;
  onPress?: () => void;
  style?: any;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.button, style]}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#7C4DFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});



