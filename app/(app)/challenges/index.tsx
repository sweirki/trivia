// app/(app)/challenges/index.tsx

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useChallengesStore } from '../../../src/challenges/store/useChallengesStore';
import { useEffect } from 'react';
import { loadItem, StorageKeys } from '../../../src/storage/storage';

type Tab = 'incoming' | 'active' | 'history';

export default function ChallengesScreen() {
  const [tab, setTab] = useState<Tab>('incoming');

  const incoming = useChallengesStore((s) => s.incoming);
  const active = useChallengesStore((s) => s.active);
  const history = useChallengesStore((s) => s.history);

  const list =
    tab === 'incoming'
      ? incoming
      : tab === 'active'
      ? active
      : history;
useEffect(() => {
  const hydrate = async () => {
    const stored = await loadItem<{
      incoming: typeof incoming;
      active: typeof active;
      history: typeof history;
    }>(StorageKeys.CHALLENGES);

    if (stored) {
      if (Array.isArray(stored.incoming)) {
        useChallengesStore.setState({ incoming: stored.incoming });
      }
      if (Array.isArray(stored.active)) {
        useChallengesStore.setState({ active: stored.active });
      }
      if (Array.isArray(stored.history)) {
        useChallengesStore.setState({ history: stored.history });
      }
    }
  };

  hydrate();
}, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Challenges</Text>

      <View style={styles.tabs}>
        {(['incoming', 'active', 'history'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={styles.tabText}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

    {list.length === 0 ? (
  <View style={styles.emptyState}>
    <Text style={styles.emptyTitle}>
      No {tab} challenges yet 👋
    </Text>
    <Text style={styles.emptyHint}>
      Try Today’s Challenge from the Home screen
    </Text>
  </View>
) : (
 list.map((c) => (
  <View key={c.id} style={styles.item}>
    <Text style={styles.itemText}>
      {c.from.username} → {c.to.username}
    </Text>

    <Text style={styles.itemMeta}>
      {c.category}
    </Text>

    {c.type === 'daily' && c.rewardClaimed && (
      <Text style={{ color: '#00E676', marginTop: 8 }}>
        🎁 Daily reward claimed!
      </Text>
    )}
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
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: '#222',
  },
  tabActive: {
    backgroundColor: '#444',
  },
  tabText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
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
  itemMeta: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 4,
  },
emptyState: {
  alignItems: 'center',
  marginTop: 48,
},
emptyTitle: {
  color: '#AAA',
  fontSize: 16,
  fontWeight: '500',
},
emptyHint: {
  color: '#777',
  fontSize: 13,
  marginTop: 8,
  textAlign: 'center',
},


});




