import React from "react";
import { StyleSheet } from "react-native";
import { Text, View, useTheme } from "@/theme";

export default function ModalScreen() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={theme.typography.h1}>Modal</Text>
      <Text style={[theme.typography.body, { marginTop: 8 }]}>
        This is a modal screen.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});



