// app/(app)/friends/index.tsx
import ScreenShell from "@/components/ScreenShell";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { addDoc, collection } from 'firebase/firestore';

import GoldCard from '@/components/GoldCard';
import PrimaryButton from '@/components/PrimaryButton';

import { auth, db } from '@/firebase/firebase';
import { useChallengesStore } from '@/challenges/store/useChallengesStore';
import type { Challenge, ChallengeResult } from '@/challenges/types';
import { useFriendsStore } from '@/friends/store/useFriendsStore';
import type { Friend } from '@/friends/types';
import { useQuickGameStore } from '@/store/useQuickGameStore';
import { useTheme } from '@/theme/useTheme';

const CHALLENGE_EXPIRES_MS = 24 * 60 * 60 * 1000;


const formatTimeLeft = (expiresAt?: number) => {
  if (!expiresAt) return 'Expires in 24h';
  const ms = Math.max(0, expiresAt - Date.now());
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));

  if (hours <= 0 && minutes <= 0) return 'Expired';
  if (hours <= 0) return `Expires in ${minutes}m`;
  return `Expires in ${hours}h ${minutes}m`;
};

export default function FriendsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const initGame = useQuickGameStore((s) => s.initGame);

  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [challengeSentId, setChallengeSentId] = useState<string | null>(null);

  const historyFade = useRef(new Animated.Value(0)).current;

  const friends = useFriendsStore((s) => s.friends);
  const requests = useFriendsStore((s) => s.requests);
  const sentRequests = useFriendsStore((s) => s.sentRequests);
  const myFriendCode = useFriendsStore((s) => s.myFriendCode);
  const loading = useFriendsStore((s) => s.loading);
  const error = useFriendsStore((s) => s.error);
  const loadRemote = useFriendsStore((s) => s.loadRemote);
  const sendFriendRequestByCode = useFriendsStore((s) => s.sendFriendRequestByCode);
  const acceptRequest = useFriendsStore((s) => s.acceptRequest);
  const rejectRequest = useFriendsStore((s) => s.rejectRequest);

  const incomingChallenges = useChallengesStore((s) => s.incoming);
  const activeChallenges = useChallengesStore((s) => s.active);
  const history = useChallengesStore((s) => s.history);
  const loadRemoteChallenges = useChallengesStore((s) => s.loadRemoteChallenges);
  const subscribeRemoteChallenges = useChallengesStore((s) => s.subscribeRemoteChallenges);
  const acceptChallenge = useChallengesStore((s) => s.acceptChallenge);
  const declineChallenge = useChallengesStore((s) => s.declineChallenge);

  const completedChallenges = useMemo(
    () => history.filter((c) => c.status === 'completed' && c.type !== 'daily'),
    [history]
  );

  useEffect(() => {
    loadRemote();
    loadRemoteChallenges();
  }, [loadRemote, loadRemoteChallenges]);

  useEffect(() => {
    const unsubscribe = subscribeRemoteChallenges();
    return () => unsubscribe();
  }, [subscribeRemoteChallenges]);

  useFocusEffect(
    useCallback(() => {
      loadRemote();
      loadRemoteChallenges();
    }, [loadRemote, loadRemoteChallenges])
  );

  useEffect(() => {
    Animated.timing(historyFade, {
      toValue: completedChallenges.length > 0 ? 1 : 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [completedChallenges.length, historyFade]);

  const onCopyCode = async () => {
    if (!myFriendCode) return;

    await Clipboard.setStringAsync(myFriendCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const onSend = async () => {
    const code = friendCodeInput.trim().toUpperCase();
    if (!code) return;
    if (code === myFriendCode) return;

    const sent = await sendFriendRequestByCode(code);
    if (sent) setFriendCodeInput('');
  };

  const sendChallengeToUser = async (friend: Friend) => {
    const myUid = auth.currentUser?.uid;
    if (!myUid || !friend.id) return;

    await addDoc(collection(db, 'challenge_requests'), {
      from: myUid,
      fromUsername: myFriendCode || 'Player',
      to: friend.id,
      toUsername: friend.username,
      users: [myUid, friend.id],
      category: 'General Knowledge',
      status: 'incoming',
      scores: {},
      completedAtBy: {},
      createdAt: Date.now(),
      expiresAt: Date.now() + CHALLENGE_EXPIRES_MS,
    });

    setChallengeSentId(friend.id);
    setTimeout(() => setChallengeSentId(null), 1400);
  };

  const sendChallenge = async (friend: Friend) => {
    await sendChallengeToUser(friend);
  };

  const rematch = async (challenge: Challenge) => {
    const myUid = auth.currentUser?.uid;
    if (!myUid) return;

    const opponent = challenge.from?.id === myUid ? challenge.to : challenge.from;
    if (!opponent?.id) return;

    await sendChallengeToUser({
      id: opponent.id,
      username: opponent.username || 'Friend',
      status: 'accepted',
    });
  };

  const playChallenge = (challengeId: string, category: string) => {
    initGame('classic', category || 'science');

    router.push({
      pathname: '/(app)/play/game',
      params: { challengeId, category },
    } as never);
  };

  const getResultLabel = (result?: ChallengeResult) => {
    if (result === 'win') return 'WIN';
    if (result === 'loss') return 'LOSS';
    if (result === 'draw') return 'DRAW';
    return 'WAITING';
  };

  const getResultStyle = (result?: ChallengeResult) => {
    if (result === 'win') return styles.winBadge;
    if (result === 'loss') return styles.lossBadge;
    if (result === 'draw') return styles.drawBadge;
    return styles.waitingBadge;
  };

  const renderSectionTitle = (title: string) => (
    <Text
      style={[
        styles.sectionTitle,
        {
          color: theme.colors.textMuted,
          marginTop: theme.spacing.lg,
          marginBottom: theme.spacing.sm,
        },
      ]}
    >
      {title}
    </Text>
  );

  const renderEmpty = (message: string) => (
    <Text style={[styles.emptyText, { color: theme.colors.textSubtle }]}>{message}</Text>
  );

  return (
    <ScreenShell accessibilityLabel="Friends screen" contentStyle={styles.content}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Friends</Text>

      <GoldCard variant="soft" style={styles.card}>
        <Text style={[styles.sectionTitle, styles.cardTitle, { color: theme.colors.textMuted }]}>
          Your Friend Code
        </Text>

        <View style={styles.codeRow}>
          <Text style={[styles.friendCode, { color: theme.colors.gold }]}>
            {myFriendCode || 'Loading...'}
          </Text>
          <PrimaryButton
            title={copied ? 'Copied' : 'Copy'}
            size="sm"
            onPress={onCopyCode}
            disabled={!myFriendCode}
            style={styles.inlineButton}
          />
        </View>

        <Text style={[styles.helperText, { color: theme.colors.textSubtle }]}>
          Share this code so friends can add you.
        </Text>
      </GoldCard>

      {renderSectionTitle('Add Friend')}
      <View style={styles.addRow}>
        <TextInput
            accessibilityLabel="Friend code"
            accessibilityHint="Enter another player friend code"
          value={friendCodeInput}
          onChangeText={setFriendCodeInput}
          placeholder="Enter friend code"
          placeholderTextColor={theme.colors.textSubtle}
          autoCapitalize="characters"
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
        />
        <PrimaryButton
          title={loading ? '...' : 'Send'}
          size="sm"
          onPress={onSend}
          disabled={!friendCodeInput.trim() || loading}
          style={styles.sendButton}
        />
      </View>

      {!!error && <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>}

      {renderSectionTitle('Friend Requests')}
      {requests.length === 0 ? (
        renderEmpty('No friend requests.')
      ) : (
        requests.map((r) => (
          <GoldCard key={r.id} style={styles.card}>
            <Text style={[styles.itemText, { color: theme.colors.text }]}>{r.from.username}</Text>
            {!!r.from.friendCode && (
              <Text style={[styles.subText, { color: theme.colors.textSubtle }]}>
                {r.from.friendCode}
              </Text>
            )}

            <View style={styles.actions}>
              <PrimaryButton
                title="Accept"
                size="sm"
                onPress={() => acceptRequest(r.id)}
                style={styles.actionButton}
              />
              <PrimaryButton
                title="Reject"
                size="sm"
                variant="danger"
                onPress={() => rejectRequest(r.id)}
              />
            </View>
          </GoldCard>
        ))
      )}

      {renderSectionTitle('Challenge Requests')}
      {incomingChallenges.length === 0 ? (
        renderEmpty('No challenge requests.')
      ) : (
        incomingChallenges.map((c, index) => {
          const challenge = c as Challenge;

          return (
            <GoldCard key={`incoming-${challenge.id}-${index}`} style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={[styles.itemText, { color: theme.colors.text }]}>
                  {challenge.from.username || 'Friend'}
                </Text>
                <Text style={[styles.timerText, { color: theme.colors.gold }]}>
                  {formatTimeLeft(challenge.expiresAt)}
                </Text>
              </View>
              <Text style={[styles.subText, { color: theme.colors.textSubtle }]}>
                {challenge.category}
              </Text>

              <View style={styles.actions}>
                <PrimaryButton
                  title="Accept"
                  size="sm"
                  onPress={() => acceptChallenge(challenge.id)}
                  style={styles.actionButton}
                />
                <PrimaryButton
                  title="Decline"
                  size="sm"
                  variant="danger"
                  onPress={() => declineChallenge(challenge.id)}
                />
              </View>
            </GoldCard>
          );
        })
      )}

      {renderSectionTitle('Active Challenges')}
      {activeChallenges.length === 0 ? (
        renderEmpty('No active challenges.')
      ) : (
        activeChallenges.map((c, index) => {
          const challenge = c as Challenge;

          return (
            <GoldCard key={`active-${challenge.id}-${index}`} style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={[styles.itemText, { color: theme.colors.text }]}>
                  {challenge.from.username || 'Friend'}
                </Text>
                {challenge.type !== 'daily' && (
                  <Text style={[styles.timerText, { color: theme.colors.gold }]}>
                    {formatTimeLeft(challenge.expiresAt)}
                  </Text>
                )}
              </View>
              <Text style={[styles.pendingText, { color: theme.colors.gold }]}>
                Active • {challenge.category}
              </Text>

              <View style={styles.actions}>
                <PrimaryButton
                  title="Play"
                  size="sm"
                  onPress={() => playChallenge(challenge.id, challenge.category)}
                />
              </View>
            </GoldCard>
          );
        })
      )}

      {renderSectionTitle('Sent Friend Requests')}
      {sentRequests.length === 0 ? (
        renderEmpty('No pending sent requests.')
      ) : (
        sentRequests.map((r) => (
          <GoldCard key={r.id} style={styles.card}>
            <Text style={[styles.itemText, { color: theme.colors.text }]}>{r.to.username}</Text>
            {!!r.to.friendCode && (
              <Text style={[styles.subText, { color: theme.colors.textSubtle }]}>
                {r.to.friendCode}
              </Text>
            )}
            <Text style={[styles.pendingText, { color: theme.colors.gold }]}>Pending</Text>
          </GoldCard>
        ))
      )}

      {renderSectionTitle('Friends List')}
      {friends.length === 0 ? (
        renderEmpty('No friends yet.')
      ) : (
        friends.map((f) => (
          <GoldCard key={f.id} style={styles.card}>
            <Text style={[styles.itemText, { color: theme.colors.text }]}>{f.username}</Text>
            {!!f.friendCode && (
              <Text style={[styles.subText, { color: theme.colors.textSubtle }]}>
                {f.friendCode}
              </Text>
            )}

            <View style={styles.actions}>
              <PrimaryButton
                title={challengeSentId === f.id ? 'Sent' : 'Challenge'}
                size="sm"
                onPress={() => sendChallenge(f)}
              />
            </View>
          </GoldCard>
        ))
      )}

      {completedChallenges.length > 0 && (
        <Animated.View style={{ opacity: historyFade }}>
          {renderSectionTitle('Completed Challenges')}

          {completedChallenges.map((c, i) => {
            const challenge = c as Challenge;

            return (
              <GoldCard
                key={`history-${challenge.id}-${i}`}
                variant="soft"
                style={styles.historyCard}
              >
                <View style={styles.rowBetween}>
                  <Text style={[styles.itemText, styles.matchupText, { color: theme.colors.text }]}>
                    {challenge.from.username || 'Friend'} vs {challenge.to.username}
                  </Text>
                  <Text style={[styles.resultBadge, getResultStyle(challenge.result)]}>
                    {getResultLabel(challenge.result)}
                  </Text>
                </View>

                <Text style={[styles.subText, { color: theme.colors.textSubtle }]}>
                  {challenge.category}
                </Text>

                <View style={styles.scoreRow}>
                  <Text style={[styles.scoreText, { color: theme.colors.text }]}>
                    {challenge.myScore ?? 0}
                  </Text>
                  <Text style={[styles.scoreDash, { color: theme.colors.gold }]}>-</Text>
                  <Text style={[styles.scoreText, { color: theme.colors.text }]}>
                    {challenge.opponentScore ?? 0}
                  </Text>
                </View>

                <Text style={[styles.rewardText, { color: theme.colors.gold }]}>
                  {challenge.result === 'win'
                    ? '+35 XP • +12 Coins'
                    : challenge.result === 'draw'
                    ? '+18 XP • +6 Coins'
                    : '+8 XP • +2 Coins'}
                </Text>

                <View style={styles.actions}>
                  <PrimaryButton
                    title="Rematch"
                    size="sm"
                    variant="secondary"
                    onPress={() => rematch(challenge)}
                  />
                </View>
              </GoldCard>
            );
          })}
        </Animated.View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 14,
  },
  card: {
    marginBottom: 10,
  },
  historyCard: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: 8,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendCode: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  inlineButton: {
    marginLeft: 8,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginRight: 8,
  },
  sendButton: {
    minWidth: 74,
  },
  errorText: {
    marginTop: 8,
    fontSize: 13,
  },
  emptyText: {
    fontSize: 14,
  },
  itemText: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  matchupText: {
    marginRight: 8,
  },
  subText: {
    fontSize: 12,
    marginTop: 3,
  },
  pendingText: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '700',
  },
  timerText: {
    flexShrink: 0,
    marginLeft: 8,
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  actionButton: {
    marginRight: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '900',
  },
  scoreDash: {
    fontSize: 22,
    fontWeight: '900',
    marginHorizontal: 16,
  },
  resultBadge: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 9,
    fontSize: 11,
    fontWeight: '900',
    color: '#fff',
  },
  winBadge: {
    backgroundColor: '#1e7f4f',
  },
  lossBadge: {
    backgroundColor: '#7f1e1e',
  },
  drawBadge: {
    backgroundColor: '#8a6d1d',
  },
  waitingBadge: {
    backgroundColor: '#555',
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },
});
