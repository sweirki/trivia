// BoosterCard.tsx — A+++++ Booster Purchase Card
import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";

export default function BoosterCard({ pack, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();

  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 14 }}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPressIn={pressIn}
        onPressOut={() => {
          pressOut();
          onPress(pack);
        }}
      >
        <View>
          <Text style={styles.label}>{pack.label}</Text>
          <Text style={styles.desc}>{pack.desc}</Text>
        </View>

        <Text style={styles.price}>{pack.price}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#FFD700",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    color: "#FFD700",
    fontWeight: "800",
    fontSize: 18,
  },

  desc: {
    color: "#FFEBC2",
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
  },

  price: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});



