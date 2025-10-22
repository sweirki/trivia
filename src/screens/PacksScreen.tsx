import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PacksScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Browse Packs</Text>
    <Text>Filter by category, difficulty, or creator.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
});

export default PacksScreen;