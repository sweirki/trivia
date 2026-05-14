import React from "react";
import { View, ViewProps, useColorScheme } from "react-native";

export function ThemedView({ style, ...props }: ViewProps) {
  const scheme = useColorScheme();
  const backgroundColor = scheme === "dark" ? "#000" : "#fff";
  return <View style={[{ backgroundColor }, style]} {...props} />;
}





