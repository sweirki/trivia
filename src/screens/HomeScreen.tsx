import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomeScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Welcome to Trivia Hub</Text>
    <Text>Browse featured packs, join tournaments, and climb the ladder.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
});

export default HomeScreen;