// app/(app)/friends/index.tsx
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { addDoc, collection } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';

import ScreenShell from '@/components/ScreenShell';
import GoldCard from '@/components/GoldCard';
import PrimaryButton from '@/components/PrimaryButton';

import { auth, db } from '@/firebase/firebase';
import { useChallengesStore } from '@/challenges/store/useChallengesStore';
import type { Challenge, ChallengeResult } from '@/challenges/types';
import { useFriendsStore } from '@/friends/store/useFriendsStore';
import type { Friend } from '@/friends/types';
import { useQuickGameStore } from '@/store/useQuickGameStore';

const FRIENDS_ART = require('../../../assets/images/lobby/friends_card_art.webp');
const LOBBY_HERO_ART = require('../../../assets/images/lobby/lobby_hero_banner.webp');

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

function SectionTitle({ title, count }: { title: string; count?: number }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionKicker}>{title}</Text>
      {typeof count === 'number' && <Text style={styles.sectionCount}>{count}</Text>}
    </View>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.emptyBox}>
      <View style={styles.emptyDot} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

function PlayerBadge({ text }: { text: string }) {
  const letter = text.trim().charAt(0).toUpperCase() || '?';
  return (
    <View style={styles.playerBadge}>
      <Text style={styles.playerBadgeText}>{letter}</Text>
    </View>
  );
}

function SocialCard({ children }: { children: ReactNode }) {
  return (
    <GoldCard variant="soft" padding="md" style={styles.socialCard}>
      {children}
    </GoldCard>
  );
}

export default function FriendsScreen() {
  const router = useRouter();
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

  return (
    <ScreenShell accessibilityLabel="Friends screen" contentStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>SOCIAL ARENA</Text>
          <Text style={styles.title}>Friends</Text>
          <Text style={styles.subtitle}>Challenge rivals and build your circle.</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>SYNC</Text>
        </View>
      </View>

      <View style={styles.heroCard}>
        <Image source={FRIENDS_ART} style={styles.heroArt} resizeMode="cover" />
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(2,6,14,0.72)", "rgba(2,6,14,0.28)", "rgba(2,6,14,0.02)"]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(110,169,255,0.16)", "rgba(255,214,110,0.06)", "rgba(0,0,0,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroInner}>
          <Text style={styles.heroLabel}>FRIEND CODE</Text>
          <View style={styles.codeRow}>
            <Text style={styles.friendCode}>{myFriendCode || 'Loading...'}</Text>
            <PrimaryButton
              title={copied ? 'Copied' : 'Copy'}
              size="sm"
              onPress={onCopyCode}
              disabled={!myFriendCode}
              style={styles.inlineButton}
            />
          </View>
          <Text style={styles.helperText}>Share your code to receive friend requests.</Text>
        </View>
      </View>

      <GoldCard variant="soft" padding="md" style={styles.addCard}>
        <Text style={styles.cardLabel}>ADD FRIEND</Text>
        <View style={styles.addRow}>
          <TextInput
            accessibilityLabel="Friend code"
            accessibilityHint="Enter another player friend code"
            value={friendCodeInput}
            onChangeText={setFriendCodeInput}
            placeholder="ENTER FRIEND CODE"
            placeholderTextColor="rgba(216,231,255,0.36)"
            autoCapitalize="characters"
            style={styles.input}
          />
          <PrimaryButton
            title={loading ? '...' : 'Send'}
            size="sm"
            onPress={onSend}
            disabled={!friendCodeInput.trim() || loading}
            style={styles.sendButton}
          />
        </View>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </GoldCard>

      <SectionTitle title="Friend Requests" count={requests.length} />
      {requests.length === 0 ? (
        <EmptyState message="No incoming requests." />
      ) : (
        requests.map((r) => (
          <SocialCard key={r.id}>
            <View style={styles.playerRow}>
              <PlayerBadge text={r.from.username} />
              <View style={styles.playerCopy}>
                <Text style={styles.itemText}>{r.from.username}</Text>
                {!!r.from.friendCode && <Text style={styles.subText}>{r.from.friendCode}</Text>}
              </View>
            </View>
            <View style={styles.actions}>
              <PrimaryButton title="Accept" size="sm" onPress={() => acceptRequest(r.id)} style={styles.actionButton} />
              <PrimaryButton title="Reject" size="sm" variant="danger" onPress={() => rejectRequest(r.id)} />
            </View>
          </SocialCard>
        ))
      )}

      <SectionTitle title="Challenge Requests" count={incomingChallenges.length} />
      {incomingChallenges.length === 0 ? (
        <EmptyState message="No challenge requests." />
      ) : (
        incomingChallenges.map((c, index) => {
          const challenge = c as Challenge;

          return (
            <SocialCard key={`incoming-${challenge.id}-${index}`}>
              <View style={styles.playerRow}>
                <PlayerBadge text={challenge.from.username || 'Friend'} />
                <View style={styles.playerCopy}>
                  <Text style={styles.itemText}>{challenge.from.username || 'Friend'}</Text>
                  <Text style={styles.subText}>{challenge.category}</Text>
                </View>
                <Text style={styles.timerText}>{formatTimeLeft(challenge.expiresAt)}</Text>
              </View>
              <View style={styles.actions}>
                <PrimaryButton title="Accept" size="sm" onPress={() => acceptChallenge(challenge.id)} style={styles.actionButton} />
                <PrimaryButton title="Decline" size="sm" variant="danger" onPress={() => declineChallenge(challenge.id)} />
              </View>
            </SocialCard>
          );
        })
      )}

      <SectionTitle title="Active Challenges" count={activeChallenges.length} />
      {activeChallenges.length === 0 ? (
        <EmptyState message="No active challenges." />
      ) : (
        activeChallenges.map((c, index) => {
          const challenge = c as Challenge;

          return (
            <SocialCard key={`active-${challenge.id}-${index}`}>
              <View style={styles.playerRow}>
                <PlayerBadge text={challenge.from.username || 'Friend'} />
                <View style={styles.playerCopy}>
                  <Text style={styles.itemText}>{challenge.from.username || 'Friend'}</Text>
                  <Text style={styles.pendingText}>Active • {challenge.category}</Text>
                </View>
                {challenge.type !== 'daily' && <Text style={styles.timerText}>{formatTimeLeft(challenge.expiresAt)}</Text>}
              </View>
              <View style={styles.actions}>
                <PrimaryButton title="Play" size="sm" onPress={() => playChallenge(challenge.id, challenge.category)} />
              </View>
            </SocialCard>
          );
        })
      )}

      <SectionTitle title="Sent Requests" count={sentRequests.length} />
      {sentRequests.length === 0 ? (
        <EmptyState message="No pending sent requests." />
      ) : (
        sentRequests.map((r) => (
          <SocialCard key={r.id}>
            <View style={styles.playerRow}>
              <PlayerBadge text={r.to.username} />
              <View style={styles.playerCopy}>
                <Text style={styles.itemText}>{r.to.username}</Text>
                {!!r.to.friendCode && <Text style={styles.subText}>{r.to.friendCode}</Text>}
                <Text style={styles.pendingText}>Pending</Text>
              </View>
            </View>
          </SocialCard>
        ))
      )}

      <SectionTitle title="Friends List" count={friends.length} />
      {friends.length === 0 ? (
        <View style={styles.emptyHero}>
          <Image source={LOBBY_HERO_ART} style={styles.emptyHeroArt} resizeMode="cover" />
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(2,6,14,0.76)", "rgba(2,6,14,0.22)"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.emptyHeroCopy}>
            <Text style={styles.emptyHeroTitle}>Build your arena circle</Text>
            <Text style={styles.emptyHeroSub}>Add friends to send challenges, track scores, and rematch rivals.</Text>
          </View>
        </View>
      ) : (
        friends.map((f) => (
          <SocialCard key={f.id}>
            <View style={styles.playerRow}>
              <PlayerBadge text={f.username} />
              <View style={styles.playerCopy}>
                <Text style={styles.itemText}>{f.username}</Text>
                {!!f.friendCode && <Text style={styles.subText}>{f.friendCode}</Text>}
              </View>
              <PrimaryButton
                title={challengeSentId === f.id ? 'Sent' : 'Challenge'}
                size="sm"
                onPress={() => sendChallenge(f)}
              />
            </View>
          </SocialCard>
        ))
      )}

      {completedChallenges.length > 0 && (
        <Animated.View style={{ opacity: historyFade }}>
          <SectionTitle title="Completed Challenges" count={completedChallenges.length} />

          {completedChallenges.map((c, i) => {
            const challenge = c as Challenge;

            return (
              <GoldCard key={`history-${challenge.id}-${i}`} variant="soft" padding="md" style={styles.historyCard}>
                <View style={styles.historyTopRow}>
                  <Text style={styles.matchupText} numberOfLines={1}>
                    {challenge.from.username || 'Friend'} vs {challenge.to.username}
                  </Text>
                  <Text style={[styles.resultBadge, getResultStyle(challenge.result)]}>
                    {getResultLabel(challenge.result)}
                  </Text>
                </View>

                <Text style={styles.subText}>{challenge.category}</Text>

                <View style={styles.scoreRow}>
                  <Text style={styles.scoreText}>{challenge.myScore ?? 0}</Text>
                  <Text style={styles.scoreDash}>-</Text>
                  <Text style={styles.scoreText}>{challenge.opponentScore ?? 0}</Text>
                </View>

                <Text style={styles.rewardText}>
                  {challenge.result === 'win'
                    ? '+35 XP • +12 Coins'
                    : challenge.result === 'draw'
                    ? '+18 XP • +6 Coins'
                    : '+8 XP • +2 Coins'}
                </Text>

                <View style={styles.actions}>
                  <PrimaryButton title="Rematch" size="sm" variant="secondary" onPress={() => rematch(challenge)} />
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
    paddingTop: 18,
    paddingBottom: 54,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  kicker: {
    color: '#7E8EA7',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.55,
    marginBottom: 3,
  },
  title: {
    color: '#F4FAFF',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#9FE7FF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(79,231,189,0.34)',
    backgroundColor: 'rgba(79,231,189,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
    backgroundColor: '#4FE7BD',
  },
  liveText: {
    color: '#4FE7BD',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  heroCard: {
    minHeight: 152,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: 'rgba(110,169,255,0.34)',
    marginBottom: 12,
    shadowColor: '#1E8CFF',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 9 },
    elevation: 7,
  },
  heroArt: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.96,
  },
  heroInner: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  heroLabel: {
    color: '#9FE7FF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.95)',
    textShadowRadius: 7,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendCode: {
    flex: 1,
    color: '#FFD66E',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.8,
    textShadowColor: 'rgba(0,0,0,0.95)',
    textShadowRadius: 8,
  },
  inlineButton: {
    marginLeft: 10,
  },
  helperText: {
    color: '#D8E7FF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowRadius: 6,
  },
  addCard: {
    backgroundColor: 'rgba(7,17,31,0.82)',
    borderColor: 'rgba(159,231,255,0.16)',
    borderRadius: 18,
    marginBottom: 12,
  },
  cardLabel: {
    color: '#7E8EA7',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.25,
    marginBottom: 9,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 13,
    marginRight: 8,
    backgroundColor: 'rgba(216,231,255,0.06)',
    borderColor: 'rgba(159,231,255,0.16)',
    color: '#F4FAFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.45,
  },
  sendButton: {
    minWidth: 76,
  },
  errorText: {
    color: '#FF8A8A',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 8,
  },
  sectionKicker: {
    color: '#D8E7FF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.35,
  },
  sectionCount: {
    minWidth: 26,
    textAlign: 'center',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    color: '#9FE7FF',
    backgroundColor: 'rgba(159,231,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(159,231,255,0.18)',
    fontSize: 10,
    fontWeight: '900',
  },
  socialCard: {
    marginBottom: 9,
    backgroundColor: 'rgba(7,17,31,0.78)',
    borderColor: 'rgba(110,169,255,0.2)',
    borderRadius: 18,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playerBadge: {
    width: 38,
    height: 38,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(159,231,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(159,231,255,0.24)',
  },
  playerBadgeText: {
    color: '#9FE7FF',
    fontSize: 15,
    fontWeight: '900',
  },
  playerCopy: {
    flex: 1,
    minWidth: 0,
  },
  itemText: {
    color: '#F4FAFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.12,
  },
  subText: {
    color: '#91A1BB',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  pendingText: {
    color: '#FFD66E',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 3,
  },
  timerText: {
    color: '#FFD66E',
    flexShrink: 0,
    marginLeft: 6,
    fontSize: 10,
    fontWeight: '900',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  actionButton: {
    marginRight: 9,
  },
  emptyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    borderRadius: 16,
    paddingHorizontal: 13,
    marginBottom: 8,
    backgroundColor: 'rgba(216,231,255,0.045)',
    borderWidth: 1,
    borderColor: 'rgba(216,231,255,0.08)',
  },
  emptyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(159,231,255,0.72)',
    marginRight: 9,
  },
  emptyText: {
    color: '#8B9AB3',
    fontSize: 11.5,
    fontWeight: '700',
  },
  emptyHero: {
    minHeight: 118,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(110,169,255,0.2)',
    backgroundColor: '#07111F',
    marginBottom: 10,
  },
  emptyHeroArt: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.82,
  },
  emptyHeroCopy: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 14,
  },
  emptyHeroTitle: {
    color: '#F4FAFF',
    fontSize: 16,
    fontWeight: '900',
  },
  emptyHeroSub: {
    color: '#BEEBFF',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    marginTop: 4,
    maxWidth: '82%',
  },
  historyCard: {
    marginBottom: 10,
    backgroundColor: 'rgba(7,17,31,0.78)',
    borderColor: 'rgba(255,214,110,0.18)',
    borderRadius: 18,
  },
  historyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  matchupText: {
    flex: 1,
    color: '#F4FAFF',
    fontSize: 13,
    fontWeight: '900',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  scoreText: {
    color: '#F4FAFF',
    fontSize: 25,
    fontWeight: '900',
  },
  scoreDash: {
    color: '#FFD66E',
    fontSize: 20,
    fontWeight: '900',
    marginHorizontal: 14,
  },
  resultBadge: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 9,
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
  },
  winBadge: {
    backgroundColor: 'rgba(40,185,118,0.9)',
  },
  lossBadge: {
    backgroundColor: 'rgba(224,75,75,0.9)',
  },
  drawBadge: {
    backgroundColor: 'rgba(204,155,48,0.9)',
  },
  waitingBadge: {
    backgroundColor: 'rgba(126,142,167,0.9)',
  },
  rewardText: {
    color: '#FFD66E',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 6,
  },
});
