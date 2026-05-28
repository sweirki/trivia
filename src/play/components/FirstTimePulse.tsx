import React from "react";
import { View, Text } from "react-native";

export function FirstTimePulse({ text }: { text: string }) {
  return (
    <View
      style={{
        marginVertical: 12,
        padding: 12,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.08)",
      }}
    >
      <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
        {text}
      </Text>
    </View>
  );
}


