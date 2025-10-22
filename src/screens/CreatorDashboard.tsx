import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { usePacks } from '../context/packStore';

export default function CreatorDashboard() {
  const { packs } = usePacks();

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

      {/* 🧠 Optimize Button */}
      <Button title="🧠 Optimize Pack" onPress={() => optimizePack(item.id)} />
    </View>
  );
};

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📊 Creator Dashboard</Text>
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
    fontWeight: 'bold',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  stat: {
    fontSize: 14,
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#555',
  },
});