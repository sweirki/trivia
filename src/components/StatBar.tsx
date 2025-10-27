import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatBar = ({ label, value, max, color = '#007AFF' }) => {
  const width = `${(value / max) * 100}%`;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}: {value}</Text>
      <View style={styles.bar}>
        <View style={[styles.fill, { width, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 10 },
  label: { fontSize: 14, marginBottom: 4 },
  bar: {
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
});

export default StatBar;