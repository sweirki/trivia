// app/(app)/friends/index.tsx
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  InteractionManager,
  Pressable,
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

function SectionTitle({ title, count, icon }: { title: string; count?: number; icon?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        {!!icon && <Text style={styles.sectionIcon}>{icon}</Text>}
        <Text style={[styles.sectionKicker,{color: icon==='👥'?'#6EE7FF':icon==='⚔'?'#FFB84D':icon==='🔥'?'#6DFF8B':icon==='🏆'?'#C57CFF':'#FFD66E'}]}>{title}</Text>
      </View>
      {typeof count === 'number' && (
        <LinearGradient colors={["rgba(110,231,255,0.22)", "rgba(197,124,255,0.14)"]} style={styles.sectionCount}>
          <Text style={styles.sectionCountText}>{count}</Text>
        </LinearGradient>
      )}
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

function PremiumPanel({ children, style }: { children: ReactNode; style?: any }) {
  return (
    <LinearGradient
      colors={["rgba(28,12,50,0.96)", "rgba(8,11,34,0.98)", "rgba(5,20,34,0.96)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.panel, style]}
    >
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(255,214,110,0.09)", "rgba(197,124,255,0.07)", "rgba(110,231,255,0.04)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </LinearGradient>
  );
}

function PremiumButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: {
  title?: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  textStyle?: any;
}) {
const colors: readonly [string, string] =
  variant === 'danger'
    ? ["#FF5B6E", "#9F1D32"]
    : variant === 'secondary' || variant === 'ghost'
    ? ["#A648FF", "#5719A8"]
    : ["#FFD66E", "#C47A12"];
    
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.buttonShell, disabled && styles.disabled, pressed && !disabled && styles.pressed, style]}
    >
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buttonFill}>
        <Text style={[styles.buttonText, variant === 'primary' && styles.buttonTextDark]}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function PlayerBadge({ text }: { text: string }) {
  const letter = text.trim().charAt(0).toUpperCase() || '?';
  return (
    <LinearGradient colors={["rgba(110,231,255,0.24)", "rgba(197,124,255,0.16)"]} style={styles.playerBadge}>
      <Text style={styles.playerBadgeText}>{letter}</Text>
    </LinearGradient>
  );
}

function SocialCard({ children }: { children: ReactNode }) {
  return <PremiumPanel style={styles.socialCard}>{children}</PremiumPanel>;
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
  const subscribeRemoteChallenges = useChallengesStore((s) => s.subscribeRemoteChallenges);
  const acceptChallenge = useChallengesStore((s) => s.acceptChallenge);
  const declineChallenge = useChallengesStore((s) => s.declineChallenge);

  const completedChallenges = useMemo(
    () => history.filter((c) => c.status === 'completed' && c.type !== 'daily'),
    [history]
  );

  const lastFriendsRefreshAt = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    const task = InteractionManager.runAfterInteractions(() => {
      if (cancelled) return;

      lastFriendsRefreshAt.current = Date.now();
      void loadRemote();
      unsubscribe = subscribeRemoteChallenges();
    });

    return () => {
      cancelled = true;
      task.cancel();
      if (unsubscribe) unsubscribe();
    };
  }, [loadRemote, subscribeRemoteChallenges]);

  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        const now = Date.now();
        if (now - lastFriendsRefreshAt.current < 30_000) return;

        lastFriendsRefreshAt.current = now;
        void loadRemote();
      });

      return () => task.cancel();
    }, [loadRemote])
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
            <PremiumButton
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

      <PremiumPanel style={styles.addCard}>
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
          <PremiumButton
            title={loading ? '...' : 'Send'}
            size="sm"
            onPress={onSend}
            disabled={!friendCodeInput.trim() || loading}
            style={styles.sendButton}
          />
        </View>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </PremiumPanel>

      <SectionTitle title="Friend Requests" count={requests.length} icon="👥" />
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
              <PremiumButton title="Accept" size="sm" onPress={() => acceptRequest(r.id)} style={styles.actionButton} />
              <PremiumButton title="Reject" size="sm" variant="danger" onPress={() => rejectRequest(r.id)} />
            </View>
          </SocialCard>
        ))
      )}

      <SectionTitle title="Challenge Requests" count={incomingChallenges.length} icon="⚔" />
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
                <PremiumButton title="Accept" size="sm" onPress={() => acceptChallenge(challenge.id)} style={styles.actionButton} />
                <PremiumButton title="Decline" size="sm" variant="danger" onPress={() => declineChallenge(challenge.id)} />
              </View>
            </SocialCard>
          );
        })
      )}

      <SectionTitle title="Active Challenges" count={activeChallenges.length} icon="🔥" />
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
                <PremiumButton title="Play" size="sm" onPress={() => playChallenge(challenge.id, challenge.category)} />
              </View>
            </SocialCard>
          );
        })
      )}

      <SectionTitle title="Sent Requests" count={sentRequests.length} icon="✈" />
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

      <SectionTitle title="Friends List" count={friends.length} icon="⭐" />
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
              <PremiumButton
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
          <SectionTitle title="Completed Challenges" count={completedChallenges.length} icon="🏆" />

          {completedChallenges.map((c, i) => {
            const challenge = c as Challenge;

            return (
              <PremiumPanel key={`history-${challenge.id}-${i}`} style={styles.historyCard}>
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
                  <PremiumButton title="Rematch" size="sm" variant="secondary" onPress={() => rematch(challenge)} />
                </View>
              </PremiumPanel>
            );
          })}
        </Animated.View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 44,
    paddingBottom: 58,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  kicker: {
    color: '#A9B8D2',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.7,
    marginBottom: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.55,
    textShadowColor: 'rgba(197,124,255,0.38)',
    textShadowRadius: 10,
  },
  subtitle: {
    color: '#9FE7FF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(79,231,189,0.42)',
    backgroundColor: 'rgba(79,231,189,0.13)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 7,
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
    letterSpacing: 0.7,
  },
  panel: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,214,110,0.22)',
    shadowColor: '#C57CFF',
    shadowOpacity: 0.13,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  heroCard: {
    minHeight: 128,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#07111F',
    borderWidth: 1,
    borderColor: 'rgba(197,124,255,0.46)',
    marginBottom: 10,
    shadowColor: '#C57CFF',
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
    padding: 15,
  },
  heroLabel: {
    color: '#9FE7FF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.25,
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
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.7,
    textShadowColor: 'rgba(0,0,0,0.95)',
    textShadowRadius: 8,
  },
  inlineButton: {
    minWidth: 76,
    marginLeft: 10,
  },
  helperText: {
    color: '#D8E7FF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    opacity: 0.92,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowRadius: 6,
  },
  addCard: {
    borderRadius: 20,
    padding: 13,
    marginBottom: 11,
  },
  cardLabel: {
    color: '#C57CFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.35,
    marginBottom: 9,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 43,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 13,
    backgroundColor: 'rgba(4,7,24,0.58)',
    borderColor: 'rgba(197,124,255,0.28)',
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
    marginTop: 12,
    marginBottom: 7,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  sectionIcon: {
    fontSize: 15,
  },
  sectionKicker: {
    color: '#F4FAFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  sectionCount: {
    minWidth: 27,
    height: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(110,231,255,0.24)',
  },
  sectionCountText: {
    color: '#9FE7FF',
    fontSize: 11,
    fontWeight: '900',
  },
  socialCard: {
    borderRadius: 19,
    padding: 12,
    marginBottom: 8,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playerBadge: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(110,231,255,0.28)',
  },
  playerBadgeText: {
    color: '#9FE7FF',
    fontSize: 16,
    fontWeight: '900',
  },
  playerCopy: {
    flex: 1,
    minWidth: 0,
  },
  itemText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: -0.08,
  },
  subText: {
    color: '#A9B8D2',
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
    gap: 8,
    marginTop: 10,
  },
  actionButton: {},
  buttonShell: {
    minWidth: 86,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#FFD66E',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonFill: {
    minHeight: 42,
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  buttonTextDark: {
    color: '#160D28',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.55,
  },
  emptyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 42,
    borderRadius: 16,
    paddingHorizontal: 13,
    marginBottom: 8,
    backgroundColor: 'rgba(17,18,42,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(197,124,255,0.18)',
  },
  emptyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9FE7FF',
    marginRight: 9,
  },
  emptyText: {
    color: '#A9B8D2',
    fontSize: 11.5,
    fontWeight: '800',
  },
  emptyHero: {
    minHeight: 112,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(197,124,255,0.26)',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  emptyHeroSub: {
    color: '#BEEBFF',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
    marginTop: 4,
    maxWidth: '84%',
  },
  historyCard: {
    borderRadius: 20,
    padding: 14,
    marginBottom: 9,
  },
  historyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  matchupText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  resultBadge: {
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  winBadge: {
    backgroundColor: '#16A34A',
  },
  lossBadge: {
    backgroundColor: '#DC2626',
  },
  drawBadge: {
    backgroundColor: '#7C3AED',
  },
  waitingBadge: {
    backgroundColor: '#64748B',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginTop: 12,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
  },
  scoreDash: {
    color: '#FFD66E',
    fontSize: 22,
    fontWeight: '900',
  },
  rewardText: {
    color: '#FFD66E',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 7,
    textAlign: 'center',
  },
});
