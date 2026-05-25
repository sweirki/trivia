// GemPackCard.tsx — A+++++ Gem Purchase Card
import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image } from "react-native";

export default function GemPackCard({ pack, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.94, useNativeDriver: true }).start();

  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 14 }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={pressIn}
        onPressOut={() => {
          pressOut();
          onPress(pack);
        }}
        style={styles.card}
      >
        <View style={styles.left}>
          <Image
            source={require("@assets/icons/gem.png")}
            style={styles.icon}
          />
          <Text style={styles.amount}>{pack.amount} Gems</Text>
        </View>

        <Text style={styles.price}>{pack.price}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#9A7BFF",
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 28,
    height: 28,
    marginRight: 12,
  },

  amount: {
    color: "#CDB6FF",
    fontSize: 18,
    fontWeight: "800",
  },

  price: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});






