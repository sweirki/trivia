// app/(app)/events/index.tsx

import { View, Text, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useLiveOpsStore } from '../../../src/liveops/store/useLiveOpsStore';

export default function EventsScreen() {
  const refreshStatuses = useLiveOpsStore((s) => s.refreshStatuses);
  const live = useLiveOpsStore((s) => s.getLiveOps());
  const upcoming = useLiveOpsStore((s) => s.getUpcomingOps());
  const ended = useLiveOpsStore((s) => s.getEndedOps());

  useEffect(() => {
    refreshStatuses();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events</Text>

      <Section title="Live" items={live} />
      <Section title="Upcoming" items={upcoming} />
      <Section title="Ended" items={ended} />
    </View>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: { id: string; title: string }[];
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {items.length === 0 ? (
        <Text style={styles.emptyText}>No events.</Text>
      ) : (
        items.map((op) => (
          <View key={op.id} style={styles.item}>
            <Text style={styles.itemText}>{op.title}</Text>
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 6,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
  },
  item: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#111',
    marginBottom: 8,
  },
  itemText: {
    color: '#fff',
    fontSize: 14,
  },
});




