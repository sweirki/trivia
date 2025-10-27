import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useLeaderboard } from '../context/leaderboardStore';
import StatBar from '../components/StatBar';

const LeaderboardScreen = () => {
  const { leaderboard, loading, getLeaderboard } = useLeaderboard();

  useEffect(() => {
    const unsubscribe = getLeaderboard('global'); // or tournamentId
    return () => unsubscribe?.();
  }, []);

  const renderItem = ({ item, index }) => (
    <View style={styles.card}>
      <Text style={styles.rank}>#{index + 1}</Text>
      <Text style={styles.name}>{item.displayName || 'Anonymous'}</Text>
      <Text style={styles.score}>Score: {item.score}</Text>
      <StatBar label="XP" value={item.xp || 0} max={1000} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Global Leaderboard</Text>
      {loading ? <Text>Loading...</Text> : (
        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.uid}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  card: { marginBottom: 15, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 8 },
  rank: { fontSize: 18, fontWeight: 'bold' },
  name: { fontSize: 16 },
  score: { fontSize: 14, marginBottom: 6 },
});

export default LeaderboardScreen;