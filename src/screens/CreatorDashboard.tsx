import React, { useState } from "react";
import { View, Text, FlatList, Button, StyleSheet, Alert } from "react-native";
import { usePacks } from "../context/packStore";

export default function CreatorDashboard() {
  const { packs, createAIPack } = usePacks();
  const [loading, setLoading] = useState(false);

  const optimizePack = (id: string) => {
    Alert.alert("Coming soon", "AI optimization for this pack will be available soon!");
  };

  const generateNewAIPack = async (category: string) => {
    try {
      setLoading(true);
      const pack = await createAIPack(category);
      Alert.alert("✅ AI Pack Created", `Generated new ${category} pack: ${pack.name}`);
    } catch (err) {
      console.warn("AI pack creation failed:", err);
      Alert.alert("❌ Error", "Failed to generate AI pack. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderPackCard = ({ item }) => {
    const totalAnswers = (item.correctCount || 0) + (item.incorrectCount || 0);
    const accuracy = totalAnswers > 0 ? Math.round((item.correctCount / totalAnswers) * 100) : 0;

    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.name || item.title}</Text>
        <Text style={styles.stat}>🎮 Plays: {item.playCount || 0}</Text>
        <Text style={styles.stat}>✅ Accuracy: {accuracy}%</Text>
        <Text style={styles.meta}>🌐 Language: {item.language}</Text>
        <Text style={styles.meta}>📚 Category: {item.category}</Text>
        <Text style={styles.meta}>🎯 Difficulty: {item.difficulty}</Text>

        <Button title="🧠 Optimize Pack" onPress={() => optimizePack(item.id)} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📊 Creator Dashboard</Text>

      {/* 🧠 AI Pack Generator Button */}
      <Button
        title={loading ? "Generating AI Pack..." : "🤖 Generate New AI Pack"}
        onPress={() => generateNewAIPack("Science")}
        disabled={loading}
      />

      <FlatList
        data={packs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPackCard}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  list: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  stat: {
    fontSize: 14,
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: "#555",
  },
});
