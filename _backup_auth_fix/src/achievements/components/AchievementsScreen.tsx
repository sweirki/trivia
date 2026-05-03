// app/achievements/AchievementsScreen.tsx

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "@/theme";
import { db } from "@/firebase/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import AchievementBadge from "./AchievementBadge";
import AchievementModal from "./AchievementModal";
import { ACHIEVEMENTS } from "../../achievements/achievementDefinitions";

export default function AchievementsScreen() {
  const theme = useTheme();

  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<any | null>(null);

useEffect(() => {
  const auth = auth;

  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (!user) {
      setUnlockedIds([]);
      return;
    }

    const ref = collection(db, "players", user.uid, "achievements");

    const unsubscribeSnapshot = onSnapshot(ref, (snap) => {
      const unlocked: string[] = [];

      snap.forEach((doc) => {
        if (doc.data()?.unlocked === true) {
          unlocked.push(doc.id);
        }
      });

      setUnlockedIds(unlocked);
    });

    return unsubscribeSnapshot;
  });

  return () => unsubscribeAuth();
}, []);


  const handlePress = (achievement: any) => {
    if (!unlockedIds.includes(achievement.id)) return;
    setSelectedAchievement(achievement);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
    <View style={styles.header}>
  <Text style={styles.title}>Achievements</Text>
  <Text style={styles.subtitle}>
    Unlock rewards as you play and improve.
  </Text>
</View>


     <ScrollView
  contentContainerStyle={styles.scrollContent}
  showsVerticalScrollIndicator={false}
>

      {["START", "VOLUME", "SKILL", "HABIT", "ECONOMY"].map((group) => (
  <View key={group}>
    <Text style={styles.sectionTitle}>{group}</Text>

    <View style={styles.grid}>
      {ACHIEVEMENTS.filter((a) => a.group === group).map((ach) => (
        <TouchableOpacity
          key={ach.id}
          activeOpacity={0.85}
          onPress={() => handlePress(ach)}
          style={styles.badgeWrapper}
        >
          <AchievementBadge
            achievement={ach}
            unlocked={unlockedIds.includes(ach.id)}
          />
        </TouchableOpacity>
      ))}
    </View>
  </View>
))}

    
      </ScrollView>

      <AchievementModal
        visible={modalVisible}
        achievement={selectedAchievement}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: "#0F172A", // same dark navy as More screen
  paddingHorizontal: 16,
  paddingTop: 16,
},

header: {
  marginBottom: 24,
},


 title: {
  fontSize: 22,
  fontWeight: "900",
  color: "#F5B942",
  letterSpacing: 0.5,
},

subtitle: {
  marginTop: 4,
  fontSize: 13,
  color: "#9AA3B2",
},
sectionTitle: {
  marginTop: 28,
  marginBottom: 14,
  fontSize: 13,
  fontWeight: "800",
  color: "#CBD5E1",
  letterSpacing: 1.6,
},


scrollContent: {
  paddingBottom: 40,
},

grid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
},



  badgeWrapper: {
    width: "48%",
    marginBottom: 14,
  },
});
