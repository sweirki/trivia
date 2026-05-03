// app/(app)/dev/index.tsx

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useChallengesStore } from '../../../src/challenges/store/useChallengesStore';
import { useFriendsStore } from '../../../src/friends/store/useFriendsStore';
import { useLiveOpsStore } from '../../../src/liveops/store/useLiveOpsStore';
import Constants from 'expo-constants';

export default function DevScreen() {
    if (!__DEV__) {
  return null;
}

  const setIncoming = useChallengesStore((s) => s.setIncoming);
  const setRequests = useFriendsStore((s) => s.setRequests);
  const setOps = useLiveOpsStore((s) => s.setOps);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DEV ACTIONS</Text>

      <Button
        label="Create Test Challenge"
        onPress={() =>
          setIncoming([
            {
              id: `challenge_${Date.now()}`,
              from: { id: 'u1', username: 'Alice' },
              to: { id: 'me', username: 'You' },
              category: 'General Knowledge',
              createdAt: Date.now(),
              status: 'incoming',
            },
          ])
        }
      />

      <Button
        label="Create Friend Request"
        onPress={() =>
          setRequests([
            {
              id: `req_${Date.now()}`,
              from: { id: 'u2', username: 'Bob', status: 'pending' },
              createdAt: Date.now(),
            },
          ])
        }
      />

      <Button
        label="Create Live Event"
        onPress={() =>
          setOps([
            {
              id: `event_${Date.now()}`,
              title: 'Double XP Weekend',
              type: 'event',
              startsAt: Date.now() - 1000,
              endsAt: Date.now() + 1000 * 60 * 60 * 24,
              status: 'live',
            },
          ])
        }
      />
    </View>
  );
}

function Button({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#000',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#333',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

