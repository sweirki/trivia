// A+++++ ScoreCounter — XP + Coins + Gems animated reward pop
import React, { useEffect, useRef } from "react";
import { Animated, Text, View, StyleSheet } from "react-native";
import { usePlayerStore } from "@/store/usePlayerStore";

export default function ScoreCounter() {
  const score = usePlayerStore((s) => s.xp); // XP is the real score progression
  const coins = usePlayerStore((s) => s.coins);
  const gems = usePlayerStore((s) => s.gems);

  const xpPop = useRef(new Animated.Value(0)).current;
  const coinPop = useRef(new Animated.Value(0)).current;
  const gemPop = useRef(new Animated.Value(0)).current;

  const last = useRef({
    xp: score,
    coins,
    gems,
  });

  const animate = (val) => {
    val.setValue(1);
    Animated.timing(val, {
      toValue: 0,
      duration: 900,
      useNativeDriver: true,
    }).start();
  };

  // XP animation
  useEffect(() => {
    if (score > last.current.xp) animate(xpPop);
    last.current.xp = score;
  }, [score]);

  // Coin animation
  useEffect(() => {
    if (coins > last.current.coins) animate(coinPop);
    last.current.coins = coins;
  }, [coins]);

  // Gem animation
  useEffect(() => {
    if (gems > last.current.gems) animate(gemPop);
    last.current.gems = gems;
  }, [gems]);

  return (
    <View style={styles.container}>
      <Text style={styles.score}>XP: {score}</Text>

      <Animated.Text
        style={[styles.pop, { color: "#FFD700", opacity: xpPop }]}
      >
        +XP
      </Animated.Text>

      <Animated.Text
        style={[styles.pop, { color: "#FFEE88", opacity: coinPop, top: 32 }]}
      >
        +Coins
      </Animated.Text>

      <Animated.Text
        style={[styles.pop, { color: "#9A7BFF", opacity: gemPop, top: 54 }]}
      >
        +Gems
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  score: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "700",
  },
  pop: {
    position: "absolute",
    fontSize: 18,
    fontWeight: "800",
  },
});




