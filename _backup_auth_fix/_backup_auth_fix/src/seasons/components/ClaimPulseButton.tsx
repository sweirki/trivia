import React, { useMemo, useRef } from "react";
import { Animated, Pressable, Text, StyleSheet, ViewStyle } from "react-native";

type Props = {
  title: string;
  disabled?: boolean;
  onPress: () => void;
  style?: ViewStyle;
};

export default function ClaimPulseButton({ title, disabled, onPress, style }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  const opacity = useMemo(() => (disabled ? 0.45 : 1), [disabled]);

  return (
    <Animated.View style={[{ transform: [{ scale }], opacity }, style]}>
      <Pressable
        disabled={!!disabled}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={styles.btn}
      >
        <Text style={styles.txt}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "#1f1f1f",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  txt: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
