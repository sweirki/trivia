// /app/play/(screens)/categorySelect.tsx
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme";

import { useQuickGameStore } from "@/store/useQuickGameStore";
import { usePlayerStore } from "@/store/usePlayerStore";

import { CATEGORIES } from "@/data/categories";

const { width } = Dimensions.get("window");
const TILE = (width - 40 - 24) / 3;

export default function CategorySelect() {
  const theme = useTheme();
  const router = useRouter();

  const resetGame = useQuickGameStore((s) => s.resetGame);
  const setCategory = useQuickGameStore((s) => s.setCategory);

  const ownedPacks = usePlayerStore((s) => s.ownedPacks);
  const vipTier = usePlayerStore((s) => s.vipTier);

  const isUnlocked = (item) => {
    if (!item.premium) return true;
    if (ownedPacks.includes(item.id)) return true;
    if (vipTier >= 3) return true; // VIP unlock rule
    return false;
  };

  const handlePress = (item) => {
  if (!isUnlocked(item)) return;

  const { initGame } = useQuickGameStore.getState();

  // Default Quick Play mode
  const mode = "classic";

 setCategory(item.id);
router.push("/(app)/play/modeSelect");
};
 const renderItem = ({ item }) => {
    const unlocked = isUnlocked(item);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => unlocked && handlePress(item)}
        style={[
          styles.tile,
          {
            borderColor: unlocked
              ? theme.colors.gold
              : "rgba(255,255,255,0.15)",
            opacity: unlocked ? 1 : 0.45,
          },
        ]}
      >
        <Image source={item.icon} style={styles.icon} />

        {!unlocked && (
          <View style={styles.lockBadge}>
            <Text style={styles.lockText}>🔒</Text>
          </View>
        )}

        <Text style={[styles.label, { color: item.color }]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Choose Category
      </Text>

      <FlatList
        data={CATEGORIES}
        numColumns={3}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  tile: {
    width: TILE,
    height: TILE * 1.15,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    borderWidth: 1.4,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    position: "relative",
  },
  icon: {
    width: 32,
    height: 32,
    marginBottom: 8,
    resizeMode: "contain",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 2,
  },
  lockBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  lockText: {
    color: "#fff",
    fontSize: 14,
  },
});


