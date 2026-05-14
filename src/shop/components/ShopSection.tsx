// ShopSection.tsx — A+++++ Reusable Section Wrapper
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function ShopSection({ title, children }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFD700",
    marginBottom: 12,
    paddingLeft: 6,
  },

  content: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.25)",
  },
});




