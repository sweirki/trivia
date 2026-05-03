import React, { useState } from "react";
import { View, Text, TouchableOpacity, LayoutAnimation, StyleSheet } from "react-native";

/**
 * Simple collapsible section placeholder.
 * Replace with your real implementation later.
 */
export function Collapsible({ title = "Section", children }: { title?: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(!open);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggle} style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text>{open ? "" : ""}</Text>
      </TouchableOpacity>
      {open && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginVertical: 6 },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 12 },
  title: { fontWeight: "bold" },
  content: { padding: 12 },
});



