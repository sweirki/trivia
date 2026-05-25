import React from "react";
import { Text, TextProps, useColorScheme } from "react-native";

export function ThemedText({ style, ...props }: TextProps) {
  const scheme = useColorScheme();
  const color = scheme === "dark" ? "#fff" : "#000";
  return <Text style={[{ color }, style]} {...props} />;
}







