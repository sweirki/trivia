// app/(app)/store/index.tsx
// STORE — COSMETICS (Phase D2.3)

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { ScrollView } from "react-native";

import { COSMETICS_CATALOG } from "@/cosmetics/catalog";
import {
  CosmeticCategory,
  CosmeticItem,
} from "@/cosmetics/types";
import { usePlayerStore } from "@/store/usePlayerStore";

const CATEGORY_TABS: CosmeticCategory[] = [
  CosmeticCategory.AVATAR,
  CosmeticCategory.AVATAR_FRAME,
  CosmeticCategory.PROFILE_BACKGROUND,
  CosmeticCategory.BADGE,
];

export default function StoreScreen() {
  const router = useRouter();

  const coins = usePlayerStore((s) => s.coins);
  const cosmetics = usePlayerStore((s) => s.cosmetics);
  const purchaseCosmetic = usePlayerStore((s) => s.purchaseCosmetic);
  const equipCosmetic = usePlayerStore((s) => s.equipCosmetic);

  const [activeCategory, setActiveCategory] = useState<CosmeticCategory>(
    CosmeticCategory.AVATAR
  );

  const filteredCatalog = useMemo(
    () =>
      COSMETICS_CATALOG.filter(
        (item) => item.category === activeCategory
      ),
    [activeCategory]
  );

  const renderItem = ({ item }: { item: CosmeticItem }) => {
    const owned = cosmetics.owned[item.id] === true;
    const isEquipped = cosmetics.equipped[item.category] === item.id;

    const canAfford =
      item.price.currency === "COINS"
        ? coins >= item.price.amount
        : false; // Gems handled later

    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.type}>{item.category}</Text>

        {owned ? (
          isEquipped ? (
            <Text style={styles.equipped}>Equipped</Text>
          ) : (
            <TouchableOpacity
              style={styles.equipButton}
              onPress={() => equipCosmetic(item.id)}
            >
              <Text style={styles.equipText}>Equip</Text>
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity
            style={[
              styles.buyButton,
              !canAfford && styles.buyDisabled,
            ]}
            disabled={!canAfford}
            onPress={() => purchaseCosmetic(item.id)}
          >
            <Text style={styles.buyText}>
              Buy • {item.price.amount} {item.price.currency}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Store</Text>
        <Text style={styles.coins}>💰 {coins}</Text>
      </View>
{__DEV__ && (
  <TouchableOpacity
    onPress={() =>
      usePlayerStore.setState((s) => ({
        coins: s.coins + 1000,
      }))
    }
    style={{ marginTop: 6 }}
  >
    <Text style={{ color: "#FF6B6B", fontSize: 11 }}>
      DEV: +1000 coins
    </Text>
  </TouchableOpacity>
)}

      {/* Category Tabs */}
  <View style={styles.tabsBar}>
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.tabsContent}
  >
    {CATEGORY_TABS.map((cat) => {
      const active = activeCategory === cat;
      return (
        <TouchableOpacity
          key={cat}
          style={[styles.tab, active && styles.tabActive]}
          onPress={() => setActiveCategory(cat)}
          activeOpacity={0.85}
        >
          <Text
            style={[styles.tabText, active && styles.tabTextActive]}
          >
            {cat.replace("_", " ")}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
</View>



      {/* Catalog */}
      <FlatList
        data={filteredCatalog}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },

  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#222",
  },

  back: {
    color: "#FFD700",
    fontSize: 14,
    marginBottom: 6,
  },

  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFD700",
  },

  coins: {
    marginTop: 4,
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },

 tabs: {
  flexDirection: "row",
  height: 40,                 // 🔥 HARD CAP HEIGHT
  alignItems: "center",       // 🔥 CENTER CONTENT
  paddingHorizontal: 12,
  borderBottomWidth: 1,
  borderColor: "#222",
},

tab: {
  height: 26,
  paddingHorizontal: 12,
  borderRadius: 13,
  marginRight: 8,
  backgroundColor: "#1A1A1A",
  justifyContent: "center",
},



tabActive: {
  backgroundColor: "#FFD700",
},


  tabText: {
    color: "#AAA",
    fontSize: 10,
    fontWeight: "700",
  },

  tabTextActive: {
    color: "#000",
  },

  list: {
    padding: 12,
  },

  card: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },

  name: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "800",
  },

  type: {
    color: "#AAA",
    fontSize: 10,
    marginBottom: 10,
  },

  equipped: {
    color: "#4CAF50",
    fontWeight: "800",
  },

  equipButton: {
    backgroundColor: "#333",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  equipText: {
    color: "#FFD700",
    fontWeight: "800",
     fontSize: 13,   // add this
  },

  buyButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  buyDisabled: {
    opacity: 0.4,
  },

  buyText: {
    color: "#000",
    fontWeight: "900",
     fontSize: 13,   // add this
  },
  tabsBar: {
  height: 44,               // 🔥 THIS LOCKS THE HEIGHT
  borderBottomWidth: 1,
  borderColor: "#222",
  justifyContent: "center",
},
tabsContent: {
  paddingHorizontal: 12,
  alignItems: "center",     // prevents vertical stretch
},

});

