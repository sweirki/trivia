import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/theme";

export default function GoldCard({ children, style }: any) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: theme.colors.gold,
          shadowColor: theme.colors.gold,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 9,      // (was 10)
    padding: 7,           // (was 8)
    backgroundColor: "rgba(0,0,0,0.55)",
    shadowOpacity: 0.12,  // (was 0.15)
    shadowRadius: 3.5,    // (was 4)
    elevation: 2,
  },
});



