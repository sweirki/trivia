import React from "react";
import { ScrollView } from "react-native";
export default function ParallaxScrollView({ children, ...props }: any) {
  return <ScrollView {...props}>{children}</ScrollView>;
}








