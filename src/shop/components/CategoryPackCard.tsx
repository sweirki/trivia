// CategoryPackCard.tsx — A+++++ Category Unlock Card
import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { CATEGORIES } from "@/data/categories";

export default function CategoryPackCard({ pack, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const categoryMeta = CATEGORIES.find((c) => c.id === pack.category);

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();

  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start();

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
        <View>
          <Text style={styles.label}>{pack.label}</Text>
          <Text style={styles.categoryText}>
            Category: {categoryMeta?.label ?? pack.category}
          </Text>
        </View>

        <Text style={styles.price}>{pack.price}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#FFD700",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "800",
  },

  categoryText: {
    color: "#FFF5CC",
    fontSize: 14,
    marginTop: 4,
  },

  price: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});






