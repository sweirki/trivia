// VIPCard.tsx — A+++++ VIP Subscription Card
import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";

export default function VIPCard({ pack, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.94, useNativeDriver: true }).start();

  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 14 }}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPressIn={pressIn}
        onPressOut={() => {
          pressOut();
          onPress(pack);
        }}
      >
        <Text style={styles.tier}>⭐ VIP {pack.tier}</Text>

        <View style={styles.benefitsBox}>
          {pack.benefits.map((b, idx) => (
            <Text key={idx} style={styles.benefit}>
              • {b}
            </Text>
          ))}
        </View>

        <Text style={styles.price}>{pack.price}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255, 217, 0, 0.12)",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#FFD700",
  },

  tier: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFD700",
    marginBottom: 10,
  },

  benefitsBox: {
    marginBottom: 10,
  },

  benefit: {
    color: "#FFFCE0",
    fontSize: 15,
    marginBottom: 3,
  },

  price: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "right",
  },
});


