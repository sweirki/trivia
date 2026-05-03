import React from "react";
import { StyleSheet, Switch } from "react-native";
import { Text, View, useTheme } from "@/theme";

export default function SettingsScreen() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={theme.typography.h1}>Settings</Text>

      <View style={[styles.row, { marginTop: theme.spacing.lg }]}>
        <Text style={theme.typography.body}>Sound Effects</Text>
        <Switch value={true} />
      </View>

      <View style={styles.row}>
        <Text style={theme.typography.body}>Notifications</Text>
        <Switch value={false} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
});


