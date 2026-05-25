import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useChallengesStore } from '@/challenges/store/useChallengesStore';

export default function AppLayout() {
  const router = useRouter();
  const loadRemoteChallenges = useChallengesStore((s) => s.loadRemoteChallenges);
  const [challengeCount, setChallengeCount] = useState(0);
  const [showChallengeModal, setShowChallengeModal] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadRemoteChallenges();

      const incomingCount = useChallengesStore.getState().incoming.length;

      if (incomingCount > 0) {
        setChallengeCount(incomingCount);
        setShowChallengeModal(true);
      }
    };

    init();
  }, [loadRemoteChallenges]);

  const closeModal = () => {
    setShowChallengeModal(false);
  };

  const openFriends = () => {
    setShowChallengeModal(false);
    router.push('/friends');
  };

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />

      <Modal transparent visible={showChallengeModal} animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Text style={styles.emoji}>⚔️</Text>
            <Text style={styles.title}>Challenge Waiting</Text>
            <Text style={styles.body}>
              You have {challengeCount} challenge{challengeCount === 1 ? '' : 's'} waiting.
            </Text>

            <View style={styles.actions}>
              <Pressable style={[styles.button, styles.secondary]} onPress={closeModal}>
                <Text style={styles.secondaryText}>Later</Text>
              </Pressable>

              <Pressable style={[styles.button, styles.primary]} onPress={openFriends}>
                <Text style={styles.primaryText}>View</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 22,
    padding: 22,
    backgroundColor: '#101623',
    borderWidth: 1,
    borderColor: 'rgba(143,183,217,0.26)',
  },
  emoji: {
    fontSize: 34,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#8FB7D9',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  body: {
    color: '#E5E7EB',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 22,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#8FB7D9',
  },
  secondary: {
    backgroundColor: '#1A2032',
    borderWidth: 1,
    borderColor: '#333',
  },
  primaryText: {
    color: '#111',
    fontWeight: '900',
  },
  secondaryText: {
    color: '#E5E7EB',
    fontWeight: '800',
  },
});



