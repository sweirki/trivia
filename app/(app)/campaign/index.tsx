import React from "react";
import { StyleSheet } from "react-native";
import { Text, View, useTheme } from "@/theme";

export default function CampaignScreen() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[theme.typography.h1]}>
        Campaign
      </Text>
      <Text style={[theme.typography.body, { marginTop: 12 }]}>
        Complete missions and progress through the saga.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});



