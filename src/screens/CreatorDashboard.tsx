import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { usePacks } from '../context/packStore';

export default function CreatorDashboard() {
  const { packs } = usePacks();

  const renderItem = ({ item }) => {
    const total = (item.correctCount || 0) + (item.incorrectCount || 0);
    const correctRate = total > 0 ? Math.round((item.correctCount / total) * 100) : 0;

    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.name || item.title}</Text>
        <Text>Plays: {item.playCount || 0}</Text>
        <Text>Correct Rate: {correctRate}%</Text>
        <Text>Language: {item.language}</Text>
        <Text>Category: {item.category}</Text>
        <Text>Difficulty: {item.difficulty}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📊 Creator Dashboard</Text>
      <FlatList
        data={packs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 20,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  card: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});