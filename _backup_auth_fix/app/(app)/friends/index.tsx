// app/(app)/friends/index.tsx

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFriendsStore } from '../../../src/friends/store/useFriendsStore';
import { useEffect } from 'react';
import { loadItem, StorageKeys } from '../../../src/storage/storage';
import { useChallengesStore } from '../../../src/challenges/store/useChallengesStore';

export default function FriendsScreen() {
  const setIncoming = useChallengesStore((s) => s.setIncoming);
  const friends = useFriendsStore((s) => s.friends);
  const requests = useFriendsStore((s) => s.requests);
  const acceptRequest = useFriendsStore((s) => s.acceptRequest);
  const rejectRequest = useFriendsStore((s) => s.rejectRequest);
useEffect(() => {
    const hydrate = async () => {
      const stored = await loadItem<{
        friends: typeof friends;
        requests: typeof requests;
      }>(StorageKeys.FRIENDS);

      if (stored) {
        if (Array.isArray(stored.friends)) {
          useFriendsStore.setState({ friends: stored.friends });
        }
        if (Array.isArray(stored.requests)) {
          useFriendsStore.setState({ requests: stored.requests });
        }
      }
    };

    hydrate();
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friends</Text>

      <Text style={styles.sectionTitle}>Requests</Text>

      {requests.length === 0 ? (
        <Text style={styles.emptyText}>No friend requests.</Text>
      ) : (
        requests.map((r) => (
          <View key={r.id} style={styles.item}>
            <Text style={styles.itemText}>{r.from.username}</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.accept}
                onPress={() => acceptRequest(r.id)}
              >
                <Text style={styles.actionText}>Accept</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.reject}
                onPress={() => rejectRequest(r.id)}
              >
                <Text style={styles.actionText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>Friends List</Text>

      {friends.length === 0 ? (
        <Text style={styles.emptyText}>No friends yet.</Text>
      ) : (
     friends.map((f) => (
  <View key={f.id} style={styles.item}>
    <Text style={styles.itemText}>{f.username}</Text>

    <View style={styles.actions}>
      <TouchableOpacity
        style={styles.accept}
        onPress={() => {
          setIncoming([
            {
              id: `challenge_${Date.now()}`,
              from: { id: 'me', username: 'You' },
              to: { id: f.id, username: f.username },
              category: 'General Knowledge',
              createdAt: Date.now(),
              status: 'incoming',
            },
          ]);
        }}
      >
        <Text style={styles.actionText}>Challenge</Text>
      </TouchableOpacity>
    </View>
  </View>
))

      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
  },
  item: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#111',
    marginBottom: 10,
  },
  itemText: {
    color: '#fff',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  accept: {
    marginRight: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#1e7f4f',
  },
  reject: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#7f1e1e',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});
