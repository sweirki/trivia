// app/achievements/AchievementsScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/theme';
import { ACHIEVEMENTS } from '@/store/achievementsList';
import AchievementBadge from './AchievementBadge';
import AchievementModal from './AchievementModal';
import { useAchievementsStore } from '@/store/achievementsStore';

export default function AchievementsScreen() {
  const theme = useTheme();
  const unlocked = useAchievementsStore((s) => s.unlocked);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalAchievementId, setModalAchievementId] = useState(null);

  const handlePress = (ach) => {
    if (unlocked.includes(ach.id)) {
      setModalAchievementId(ach.id);
      setModalVisible(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

      <Text style={[styles.title, { color: theme.colors.text }]}>Achievements</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
        Unlock badges by leveling up, scoring combos, and mastering categories!
      </Text>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {ACHIEVEMENTS.map((ach) => (
          <View key={ach.id} style={styles.badgeWrapper}>
            <View style={{ width: '100%' }}>
              <View onTouchEnd={() => handlePress(ach)}>
                <AchievementBadge achievement={ach} />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <AchievementModal
        visible={modalVisible}
        achievementId={modalAchievementId}
        onClose={() => setModalVisible(false)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 52,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 25,
  },
  grid: {
    paddingBottom: 100,
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badgeWrapper: {
    width: '45%',
    alignItems: 'center',
  },
});


