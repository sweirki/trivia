import React from "react";
import { TouchableOpacity, Image, StyleSheet, Animated } from "react-native";
import { Text, useTheme } from "@/theme";

export default function HeroTile({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  const scale = new Animated.Value(1);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start(onPress)}
        style={[
          styles.tile,
          { borderColor: theme.colors.gold, shadowColor: theme.colors.gold },
        ]}
      >
        <Image
          source={require("@assets/images/icon.png")}
          style={styles.icon}
        />

        <Text style={[theme.typography.h1, { fontSize: 18 }]}>Quick Play</Text>

        <Text style={[theme.typography.small, { fontSize: 10, marginTop: 1 }]}>
          Start instantly
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,        // (was 12)
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  icon: {
    width: 34,                  // (was 40)
    height: 34,
    resizeMode: "contain",
    marginBottom: 4,
  },
});



