import React, { useRef } from "react";
import { TouchableOpacity, Animated, StyleSheet } from "react-native";
import { Text, useTheme } from "@/theme";

export default function GoldButton({ title, onPress, style, textStyle }: any) {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start()}
        onPressOut={() => {
          Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start();
          onPress && onPress();
        }}
        style={[
          styles.btn,
          { backgroundColor: theme.colors.gold, shadowColor: theme.colors.gold },
          style,
        ]}
      >
        <Text style={[styles.text, { color: theme.colors.background }, textStyle]}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 5,      // (was 6)
    paddingHorizontal: 10,   // (was 12)
    borderRadius: 7,
    alignItems: "center",
    shadowRadius: 3,
    shadowOpacity: 0.2,
    elevation: 1.5,
  },
  text: {
    fontSize: 12,            // (was 13)
    fontWeight: "700",
  },
});


