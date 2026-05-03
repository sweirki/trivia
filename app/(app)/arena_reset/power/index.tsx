import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { useArenaStore } from "@/arena/store/useArenaStore";
import { usePowerUpStore } from "@/arena/store/usePowerUpStore";
import { router } from "expo-router";
import { s } from "@/arena/theme/arenaSizing";
import { usePowerArenaMatchStore } from "@/arena/power/store/usePowerArenaMatchStore";
import sampleQuestions from "../../../../assets/data/sampleQuestions.json";
import type { RawQuestion } from "@/questions/normalizeQuestions";


export default function PowerUpArenaEntry() {
  const { setMode } = useArenaStore();
  const { powerups } = usePowerUpStore();

 const handleStart = () => {
  setMode("power");

  // START POWER MATCH (REQUIRED)
const shuffled = [...(sampleQuestions as unknown as RawQuestion[])].sort(
  () => Math.random() - 0.5
);

const questions = shuffled.slice(0, 5).map(q => ({
  id: String(q.id),
  question: q.text,        // ✅ FIX
  options: q.answers,
  correctAnswer: q.correct // ✅ FIX
}));



usePowerArenaMatchStore.getState().startMatch(questions);



  router.push("/(app)/arena_reset/power/PowerMatch");
};


  return (
    <View style={styles.container}>

      <Text style={styles.title}>Power-Up Arena</Text>
      <Text style={styles.sub}>Strategy • Chaos • Domination</Text>

      {/* Equipped Power-Ups */}
      <View style={styles.powerBox}>
        <Text style={styles.powerTitle}>Your Power-Ups</Text>

        <View style={styles.powerList}>
          {Object.keys(powerups).length === 0 && (
            <Text style={styles.noPower}>No power-ups equipped</Text>
          )}

          {Object.keys(powerups).map(key => (
            <View key={key} style={styles.powerItem}>
              <Text style={styles.powerName}>{powerups[key].name}</Text>
              <Text style={styles.powerQty}>x{powerups[key].qty}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.manageBtn}
          onPress={() => router.push("/shop")}
        >
          <Text style={styles.manageText}>Manage Power-Ups</Text>
        </TouchableOpacity>
      </View>

      {/* Rules */}
      <View style={styles.rulesBox}>
        <Text style={styles.rulesTitle}>Rules</Text>
        <Text style={styles.rule}>• Use power-ups to gain advantage</Text>
        <Text style={styles.rule}>• Freeze time, reroll questions, shield mistakes</Text>
        <Text style={styles.rule}>• Win to gain Arena XP</Text>
        <Text style={styles.rule}>• Strategy matters more than speed</Text>
      </View>

      {/* Start */}
      <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
        <Text style={styles.startText}>Start Power-Up Match</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0e14",
    paddingHorizontal: s(20),
    paddingTop: s(60),
    alignItems: "center",
  },

  title: {
    fontSize: s(36),
    fontWeight: "800",
    color: "#4FC3F7",
  },

  sub: {
    color: "#aaa",
    fontSize: s(16),
    marginTop: s(6),
    marginBottom: s(30),
  },

  powerBox: {
    width: "90%",
    backgroundColor: "#101620",
    borderRadius: s(14),
    padding: s(20),
    marginBottom: s(25),
  },

  powerTitle: {
    color: "#fff",
    fontSize: s(20),
    marginBottom: s(10),
  },

  powerList: {
    marginTop: s(10),
    marginBottom: s(15),
  },

  noPower: {
    color: "#777",
    fontStyle: "italic",
    fontSize: s(14),
  },

  powerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: s(8),
  },

  powerName: {
    color: "#fff",
    fontSize: s(16),
  },

  powerQty: {
    color: "#4FC3F7",
    fontSize: s(16),
  },

  manageBtn: {
    backgroundColor: "#1b2533",
    paddingVertical: s(12),
    borderRadius: s(12),
    marginTop: s(15),
  },

  manageText: {
    color: "#4FC3F7",
    textAlign: "center",
    fontSize: s(16),
  },

  rulesBox: {
    width: "90%",
    backgroundColor: "#14141e",
    padding: s(20),
    borderRadius: s(14),
    marginBottom: s(40),
  },

  rulesTitle: {
    color: "#fff",
    fontSize: s(20),
    marginBottom: s(10),
  },

  rule: {
    color: "#aaa",
    fontSize: s(14),
    marginBottom: s(6),
  },

  startBtn: {
    width: "85%",
    backgroundColor: "#4FC3F7",
    paddingVertical: s(18),
    borderRadius: s(14),
  },

  startText: {
    color: "#000",
    textAlign: "center",
    fontSize: s(18),
    fontWeight: "700",
  },
});



