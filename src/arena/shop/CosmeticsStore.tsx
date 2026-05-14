import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { CosmeticCategory } from "@/cosmetics/types";
import {
  COSMETIC_CATEGORY_LABELS,
  COSMETIC_STORE_TABS,
  getCosmeticsByCategory,
} from "@/cosmetics/cosmeticSelectors";
import { usePlayerStore } from "@/store/usePlayerStore";
import { usePurchaseStore } from "@/store/purchaseStore";

/**
 * Reusable cosmetics shop block for Arena or future store placements.
 * The main Store screen has its own richer cards; this component keeps the
 * same ownership/equip/purchase logic so cosmetics are never duplicated.
 */
export default function CosmeticsStore() {
  const [activeCategory, setActiveCategory] = useState<CosmeticCategory>(CosmeticCategory.AVATAR);
  const cosmetics = usePlayerStore((s) => s.cosmetics);
  const coins = usePlayerStore((s) => s.coins);
  const gems = usePlayerStore((s) => s.gems);
  const equipCosmetic = usePlayerStore((s) => s.equipCosmetic);
  const buyCosmetic = usePurchaseStore((s) => s.buyCosmetic);
  const [message, setMessage] = useState<string | null>(null);

  const items = getCosmeticsByCategory(activeCategory);

  return (
    <View style={styles.root}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {COSMETIC_STORE_TABS.map((category) => {
          const active = activeCategory === category;

          return (
            <TouchableOpacity
              key={category}
              activeOpacity={0.78}
              onPress={() => setActiveCategory(category)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {COSMETIC_CATEGORY_LABELS[category]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      {items.map((item) => {
        const owned = cosmetics.owned?.[item.id] === true;
        const equipped = cosmetics.equipped?.[item.category] === item.id;
        const canAfford = item.price.currency === "COINS" ? coins >= item.price.amount : gems >= item.price.amount;

        return (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{item.name}</Text>
              <Text style={styles.badge}>{item.vipOnly ? "VIP" : item.rarity}</Text>
            </View>
            <Text style={styles.subtitle}>{item.description}</Text>
            <Text style={styles.cost}>
              {owned ? "Owned" : `${item.price.amount} ${item.price.currency}`}
            </Text>

            <TouchableOpacity
              activeOpacity={0.78}
              disabled={equipped || (!owned && !canAfford)}
              onPress={() => {
                if (owned) {
                  setMessage(equipCosmetic(item.id) ? "Cosmetic equipped." : "Could not equip cosmetic.");
                  return;
                }

                const result = buyCosmetic(item.id);
                setMessage(result.message);
              }}
              style={[styles.button, (equipped || (!owned && !canAfford)) && styles.buttonDisabled]}
            >
              <Text style={[styles.buttonText, (equipped || (!owned && !canAfford)) && styles.buttonTextDisabled]}>
                {equipped ? "Equipped" : owned ? "Equip" : canAfford ? "Buy" : "Not enough balance"}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12 },
  tabs: { gap: 8, paddingVertical: 8 },
  tab: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#171B2A",
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { backgroundColor: "#FFD34D" },
  tabText: { color: "#AAB0C0", fontSize: 11, fontWeight: "900" },
  tabTextActive: { color: "#090909" },
  message: {
    color: "#D8FFE1",
    backgroundColor: "#16251A",
    borderColor: "#2F8F46",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    fontSize: 12,
    fontWeight: "800",
  },
  card: {
    backgroundColor: "#171B2A",
    borderColor: "#2A3042",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  title: { color: "#FFD34D", fontSize: 15, fontWeight: "900", flex: 1 },
  badge: {
    color: "#080811",
    backgroundColor: "#FFD34D",
    overflow: "hidden",
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 9,
    fontWeight: "900",
  },
  subtitle: { color: "#C6CAD7", fontSize: 12, lineHeight: 18, marginTop: 7 },
  cost: { color: "#FFFFFF", fontSize: 12, fontWeight: "900", marginTop: 10 },
  button: {
    marginTop: 12,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFD34D",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { backgroundColor: "#2B2E39" },
  buttonText: { color: "#090909", fontSize: 13, fontWeight: "900" },
  buttonTextDisabled: { color: "#808696" },
});
