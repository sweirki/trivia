import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function GoldBackground({ children }: any) {
  return (
    <LinearGradient
      colors={["#0d0d0d", "#1a1a1a", "#000"]}
      style={styles.full}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1 },
});




