// app/achievements/AchievementModal.tsx
import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/theme';
import ConfettiView from '../play/components/ConfettiView';
import { useAchievementsStore } from '@/store/achievementsStore';

export default function AchievementModal({ visible, achievementId, onClose }) {
  const theme = useTheme();

  if (!achievementId) return null;

  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!achievement) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.colors.backgroundSoft }]}>

          <ConfettiView />

          <Image source={achievement.icon} style={styles.icon} />

          <Text style={[styles.name, { color: theme.colors.gold }]}>
            {achievement.name}
          </Text>

          <Text style={[styles.desc, { color: theme.colors.text }]}>
            {achievement.description}
          </Text>

          <Text style={[styles.reward, { color: theme.colors.textMuted }]}>
            +{achievement.xpReward} XP
          </Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonTxt}>Continue</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    position: 'relative',
  },
  icon: {
    width: 64,
    height: 64,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  desc: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 14,
  },
  reward: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  buttonTxt: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
});


