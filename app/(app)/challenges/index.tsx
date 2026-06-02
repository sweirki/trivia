// app/(app)/challenges/index.tsx

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import ScreenShell from '@/components/ScreenShell';
import { loadItem, StorageKeys } from '@/storage/storage';
import { useChallengesStore } from '@/challenges/store/useChallengesStore';
import type { Challenge } from '@/challenges/types';

type Tab = 'incoming' | 'active' | 'history';

const TABS: { key: Tab; label: string; icon: string; accent: string }[] = [
  { key: 'incoming', label: 'Inbox', icon: '✉', accent: '#FFD66E' },
  { key: 'active', label: 'Active', icon: '⚔', accent: '#6EE7FF' },
  { key: 'history', label: 'History', icon: '↻', accent: '#C57CFF' },
];

const formatTimeLeft = (expiresAt?: number) => {
  if (!expiresAt) return '24h window';
  const ms = Math.max(0, expiresAt - Date.now());
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));

  if (hours <= 0 && minutes <= 0) return 'Expired';
  if (hours <= 0) return `${minutes}m left`;
  return `${hours}h ${minutes}m left`;
};

const getEmptyCopy = (tab: Tab) => {
  if (tab === 'incoming') {
    return {
      icon: '⚔',
      title: 'No challenge invites yet',
      body: 'When friends challenge you, their invites will land here first.',
    };
  }

  if (tab === 'active') {
    return {
      icon: '🔥',
      title: 'No active rivalries',
      body: 'Send a challenge from Friends or accept an invite to start a live battle.',
    };
  }

  return {
    icon: '🏆',
    title: 'No challenge history',
    body: 'Completed battles, scores, rewards, and rematches will appear here.',
  };
};

function PremiumPanel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <LinearGradient
      colors={["rgba(32,11,54,0.96)", "rgba(7,10,33,0.98)", "rgba(5,17,32,0.96)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.panel, style]}
    >
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(255,214,110,0.11)", "rgba(197,124,255,0.08)", "rgba(110,231,255,0.04)"]}
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
  icon,
  variant = 'gold',
  onPress,
  style,
}: {
  title: string;
  icon?: string;
  variant?: 'gold' | 'violet' | 'cyan';
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
 const colors: readonly [string, string] =
  variant === 'violet'
    ? ["#A648FF", "#5719A8"]
    : variant === 'cyan'
    ? ["#6EE7FF", "#137D9D"]
    : ["#FFD66E", "#C47A12"];

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.buttonShell, pressed && styles.pressed, style]}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buttonFill}>
        {!!icon && <Text style={styles.buttonIcon}>{icon}</Text>}
        <Text style={[styles.buttonText, variant === 'gold' && styles.buttonTextDark]}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function PlayerBadge({ name }: { name: string }) {
  const letter = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <LinearGradient colors={["rgba(110,231,255,0.24)", "rgba(197,124,255,0.16)"]} style={styles.playerBadge}>
      <Text style={styles.playerBadgeText}>{letter}</Text>
    </LinearGradient>
  );
}

function MetricPill({ item, count, selected, onPress }: { item: (typeof TABS)[number]; count: number; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.metricShell, selected && styles.metricSelected, pressed && styles.pressed]}>
      <LinearGradient
        colors={selected ? ["rgba(255,214,110,0.24)", "rgba(26,18,56,0.94)"] : ["rgba(13,21,48,0.92)", "rgba(19,11,43,0.9)"]}
        style={styles.metricFill}
      >
        <View style={styles.metricTopRow}>
          <Text style={[styles.metricIcon, { color: item.accent }]}>{item.icon}</Text>
          <Text style={[styles.metricLabel, selected && { color: item.accent }]}>{item.label}</Text>
        </View>
        <Text style={[styles.metricCount, { color: selected ? item.accent : '#F4FAFF' }]}>{count}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const fromName = challenge.from?.username || 'Friend';
  const toName = challenge.to?.username || 'You';
  const result = challenge.result ? challenge.result.toUpperCase() : challenge.status.toUpperCase();
  const isComplete = challenge.status === 'completed';

  return (
    <PremiumPanel style={styles.challengeCard}>
      <View style={styles.challengeTopRow}>
        <PlayerBadge name={fromName} />
        <View style={styles.challengeCopy}>
          <Text style={styles.challengeTitle} numberOfLines={1}>{fromName} vs {toName}</Text>
          <Text style={styles.challengeMeta} numberOfLines={1}>{challenge.category || 'General Knowledge'}</Text>
        </View>
        <View style={[styles.statusPill, isComplete && styles.statusPillComplete]}>
          <Text style={styles.statusText}>{result}</Text>
        </View>
      </View>

      <View style={styles.challengeFooter}>
        <Text style={styles.footerText}>{isComplete ? 'Battle archived' : formatTimeLeft(challenge.expiresAt)}</Text>
        {isComplete ? (
          <Text style={styles.rewardText}>{challenge.myScore ?? 0} - {challenge.opponentScore ?? 0}</Text>
        ) : (
          <Text style={styles.rewardText}>Rivalry live</Text>
        )}
      </View>
    </PremiumPanel>
  );
}

export default function ChallengesScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('incoming');

  const incoming = useChallengesStore((s) => s.incoming);
  const active = useChallengesStore((s) => s.active);
  const history = useChallengesStore((s) => s.history);

  const list = useMemo(() => {
    if (tab === 'incoming') return incoming;
    if (tab === 'active') return active;
    return history;
  }, [active, history, incoming, tab]);

  const counts = useMemo(
    () => ({ incoming: incoming.length, active: active.length, history: history.length }),
    [active.length, history.length, incoming.length]
  );

  useEffect(() => {
    const hydrate = async () => {
      const stored = await loadItem<{
        incoming: typeof incoming;
        active: typeof active;
        history: typeof history;
      }>(StorageKeys.CHALLENGES);

      if (stored) {
        if (Array.isArray(stored.incoming)) useChallengesStore.setState({ incoming: stored.incoming });
        if (Array.isArray(stored.active)) useChallengesStore.setState({ active: stored.active });
        if (Array.isArray(stored.history)) useChallengesStore.setState({ history: stored.history });
      }
    };

    hydrate();
  }, []);

  const emptyCopy = getEmptyCopy(tab);

  return (
    <ScreenShell accessibilityLabel="Challenges screen" contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.kicker}>SOCIAL ARENA</Text>
          <Text style={styles.title}>Challenges</Text>
          <Text style={styles.subtitle}>Track invites, active battles, and rematches.</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <PremiumPanel style={styles.heroCard}>
        <View style={styles.heroAura} />
        <Text style={styles.heroLabel}>RIVALRY CENTER</Text>
        <Text style={styles.heroTitle}>Challenge friends without leaving the premium loop.</Text>
        <Text style={styles.heroBody}>Fast challenge inbox, live battle tracking, and instant route back to your social console.</Text>
        <View style={styles.heroActions}>
          <PremiumButton title="Open Friends" icon="👥" onPress={() => router.push('/friends')} style={styles.heroButton} />
          <PremiumButton title="View Inbox" icon="✉" variant="violet" onPress={() => setTab('incoming')} style={styles.heroButton} />
        </View>
      </PremiumPanel>

      <View style={styles.metricsRow}>
        {TABS.map((item) => (
          <MetricPill key={item.key} item={item} count={counts[item.key]} selected={tab === item.key} onPress={() => setTab(item.key)} />
        ))}
      </View>

      {list.length === 0 ? (
        <PremiumPanel style={styles.emptyCard}>
          <LinearGradient colors={["rgba(255,214,110,0.22)", "rgba(197,124,255,0.18)"]} style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>{emptyCopy.icon}</Text>
          </LinearGradient>
          <Text style={styles.emptyTitle}>{emptyCopy.title}</Text>
          <Text style={styles.emptyBody}>{emptyCopy.body}</Text>
        </PremiumPanel>
      ) : (
        <View style={styles.list}>
          {list.map((challenge, index) => (
            <ChallengeCard key={`${tab}-${challenge.id}-${index}`} challenge={challenge as Challenge} />
          ))}
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 14,
    paddingBottom: 58,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  titleBlock: {
    flex: 1,
  },
  kicker: {
    color: '#A9B8D2',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.7,
    marginBottom: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
    textShadowColor: 'rgba(197,124,255,0.4)',
    textShadowRadius: 10,
  },
  subtitle: {
    color: '#9FE7FF',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 4,
    maxWidth: 270,
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
    borderColor: 'rgba(255,214,110,0.24)',
    shadowColor: '#C57CFF',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
  heroCard: {
    minHeight: 210,
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
  },
  heroAura: {
    position: 'absolute',
    right: -28,
    top: 22,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(197,124,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,214,110,0.18)',
  },
  heroLabel: {
    color: '#FFD66E',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.3,
    marginBottom: 9,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 29,
    letterSpacing: -0.35,
    maxWidth: 270,
  },
  heroBody: {
    color: '#D8E7FF',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 11,
    maxWidth: 290,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  heroButton: {
    flex: 1,
  },
  buttonShell: {
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    shadowColor: '#FFD66E',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  buttonFill: {
    minHeight: 48,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  buttonIcon: {
    fontSize: 16,
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
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metricShell: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(110,231,255,0.18)',
  },
  metricSelected: {
    borderColor: 'rgba(255,214,110,0.58)',
  },
  metricFill: {
    minHeight: 74,
    padding: 11,
    justifyContent: 'space-between',
  },
  metricTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricIcon: {
    fontSize: 12,
  },
  metricLabel: {
    color: '#A9B8D2',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.35,
  },
  metricCount: {
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyCard: {
    minHeight: 308,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingVertical: 32,
  },
  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,214,110,0.38)',
    marginBottom: 18,
  },
  emptyIconText: {
    fontSize: 30,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  emptyBody: {
    color: '#D8E7FF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  list: {
    gap: 10,
  },
  challengeCard: {
    borderRadius: 20,
    padding: 14,
  },
  challengeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
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
  challengeCopy: {
    flex: 1,
    minWidth: 0,
  },
  challengeTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.1,
  },
  challengeMeta: {
    color: '#A9B8D2',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  statusPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,214,110,0.35)',
    backgroundColor: 'rgba(255,214,110,0.12)',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusPillComplete: {
    borderColor: 'rgba(197,124,255,0.38)',
    backgroundColor: 'rgba(197,124,255,0.12)',
  },
  statusText: {
    color: '#FFD66E',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.45,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: 'rgba(216,231,255,0.09)',
  },
  footerText: {
    color: '#A9B8D2',
    fontSize: 12,
    fontWeight: '800',
  },
  rewardText: {
    color: '#FFD66E',
    fontSize: 12,
    fontWeight: '900',
  },
});
