import React from "react";
import { Pressable } from "react-native";

export function HapticTab({ children, ...props }: any) {
  return <Pressable {...props}>{children}</Pressable>;
}










