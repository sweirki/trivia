// app/achievements/AchievementBadge.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import { useAchievementsStore } from '@/store/achievementsStore';


export default function AchievementBadge({ achievement }) {
  const theme = useTheme();
  const unlocked = useAchievementsStore((s) => s.unlocked.includes(achievement.id));

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: unlocked ? theme.colors.gold : theme.colors.textMuted,
          opacity: unlocked ? 1 : 0.5,
        },
      ]}
    >
      <Image source={achievement.icon} style={styles.icon} />

      <Text style={[styles.name, { color: theme.colors.text }]}>
        {achievement.name}
      </Text>

      <Text style={[styles.desc, { color: theme.colors.textMuted }]}>
        {achievement.description}
      </Text>

      {!unlocked && (
        <View style={styles.lockOverlay}>
          <Text style={styles.lockText}>LOCKED</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    minHeight: 155,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 16,
    borderWidth: 2,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    position: 'relative',
  },
  icon: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  desc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 14,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  lockText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFD700',
  },
});


