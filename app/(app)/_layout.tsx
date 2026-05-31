import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useChallengesStore } from '@/challenges/store/useChallengesStore';
import GlobalAchievementUnlockLayer from '@/achievements/components/GlobalAchievementUnlockLayer';

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
      <Stack screenOptions={{ headerShown: false, animation: "fade", gestureEnabled: false }} />
      <GlobalAchievementUnlockLayer />

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
    backgroundColor: 'rgba(2, 6, 23, 0.84)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 390,
    borderRadius: 26,
    padding: 22,
    backgroundColor: '#101827',
    borderWidth: 1.5,
    borderColor: 'rgba(159,231,255,0.28)',
    shadowColor: '#1E8CFF',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  emoji: {
    fontSize: 34,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#F4FAFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  body: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 22,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#00D4FF',
  },
  secondary: {
    backgroundColor: 'rgba(27,36,58,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(159,231,255,0.18)',
  },
  primaryText: {
    color: '#07111F',
    fontWeight: '900',
  },
  secondaryText: {
    color: '#D8E7FF',
    fontWeight: '900',
  },
});
