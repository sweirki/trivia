import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { CATEGORIES } from "@/data/categories";
import { usePlayerStore } from "@/store/usePlayerStore";

export default function CategorySelect() {
 const CATEGORIES = [
  { key: "geography", label: "Geography", icon: "🌍", premium: false },
  { key: "science", label: "Science", icon: "🧪", premium: false },
  { key: "history", label: "History", icon: "📜", premium: false },
  { key: "movies", label: "Movies", icon: "🎬", premium: false },
  { key: "music", label: "Music", icon: "🎵", premium: false },
  { key: "literature", label: "Literature", icon: "📖", premium: false },
  { key: "sports", label: "Sports", icon: "🏆", premium: false },
  { key: "general", label: "General Knowledge", icon: "❓", premium: false },
  { key: "logic", label: "Logic", icon: "♟️", premium: false },
  { key: "technology", label: "Technology", icon: "💻", premium: false },
  { key: "gaming", label: "Gaming", icon: "🎮", premium: false },

  // PREMIUM
  { key: "anime", label: "Anime", icon: "🌸", premium: true },
  { key: "celebrities", label: "Celebrities", icon: "⭐", premium: true },
  { key: "food", label: "Food", icon: "🍔", premium: true },
  { key: "space", label: "Space", icon: "🪐", premium: true },
  { key: "mythology", label: "Mythology", icon: "⚡", premium: true },
  { key: "animals", label: "Animals", icon: "🐾", premium: true },
];




  const router = useRouter();
  const owned = usePlayerStore((s) => s.ownedPacks);

  const free = CATEGORIES.filter((c) => !c.premium);
  const premium = CATEGORIES.filter((c) => c.premium);

 const renderCard = (c: any, locked: boolean) => (
  <Pressable
    key={c.key}
    disabled={locked}
    onPress={() =>
      router.push(`/play/quick?category=${c.key}`)
    }
    style={({ pressed }) => [
      styles.card,
      locked && styles.cardLocked,
      pressed && !locked && { transform: [{ scale: 0.97 }] },
    ]}
  >
    <View style={styles.iconWrap}>
      <Text style={[styles.icon, locked && styles.iconLocked]}>
        {c.icon}
      </Text>
    </View>

    {/* NAME — THIS WAS MISSING */}
    <Text
      style={[
        styles.cardTitle,
        locked && styles.textMuted,
      ]}
      numberOfLines={2}
  
    >
      {c.label}
    </Text>

    {locked && <Text style={styles.lock}>🔒</Text>}
  </Pressable>
);


  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Choose Category</Text>

      {/* FREE */}
    <View style={styles.grid}>
  {free.map(c => renderCard(c, false))}
</View>

<Text style={styles.section}>Premium Categories</Text>
<Text style={styles.sectionSub}>Unlock with VIP or Coins</Text>

<View style={styles.grid}>
  {premium.map(c =>
    renderCard(c, !owned.includes(c.key))
  )}
</View>


      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    STYLE                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0B1220",
  },
  container: {
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFD166",
    marginBottom: 20,
  },

  section: {
    marginTop: 30,
    fontSize: 18,
    fontWeight: "700",
    color: "#E5E7EB",
  },
  sectionSub: {
    marginTop: 4,
    marginBottom: 16,
    color: "#9CA3AF",
    fontSize: 13,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },

card: {
  width: "30%",
  aspectRatio: 1,
  backgroundColor: "#121A2F",
  borderRadius: 18,
  paddingVertical: 14,
  paddingHorizontal: 8,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
borderColor: "rgba(234, 179, 8, 0.35)", // soft gold

  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 10,
  elevation: 4,
},

  cardLocked: {
    backgroundColor: "#0F1628",
    opacity: 0.55,
  },

 iconWrap: {
  width: 46,
  height: 46,
  borderRadius: 23,
  backgroundColor: "#1E293B",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 8,
},


  icon: {
    color: "#FFD166",
    fontSize: 20,
    fontWeight: "700",
  },

  iconLocked: {
    color: "#6B7280",
  },

 cardTitle: {
  fontSize: 13,
  fontWeight: "700",
  color: "#E5E7EB",
  textAlign: "center",
  lineHeight: 16,
},

  textMuted: {
    color: "#9CA3AF",
  },

 lock: {
  position: "absolute",
  top: 8,
  right: 8,
  fontSize: 13,
},

});

