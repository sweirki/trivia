import React from "react";
import { Text, TextProps } from "react-native";

/**
 * Simple placeholder icon component.
 * Replace with your real vector-icons implementation later.
 */
export function IconSymbol({ children, ...props }: TextProps) {
  return <Text {...props}>{children ?? ""}</Text>;
}




