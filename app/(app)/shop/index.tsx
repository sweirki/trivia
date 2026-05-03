// /app/(app)/shop/index.tsx
// A+++++ PREMIUM SHOP — FULL VERSION

import React, { useState } from "react";
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

import { usePlayerStore } from "@/store/usePlayerStore";

import ShopSection from "@/shop/components/ShopSection";
import CoinPackCard from "@/shop/components/CoinPackCard";
import GemPackCard from "@/shop/components/GemPackCard";
import VIPCard from "@/shop/components/VIPCard";
import BoosterCard from "@/shop/components/BoosterCard";
import CategoryPackCard from "@/shop/components/CategoryPackCard";

import PurchaseModal from "@/shop/components/PurchaseModal";
import RewardBurst from "@/shop/components/RewardBurst";

import {
  COIN_PACKS,
  GEM_PACKS,
  VIP_SUBSCRIPTIONS,
  BOOSTER_PACKS,
  CATEGORY_PACKS,
} from "@/shop/shopData";

export default function ShopScreen() {
  const router = useRouter();

  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [rewardTrigger, setRewardTrigger] = useState(false);

  const player = usePlayerStore();

  // ------------------------------
  // PURCHASE HANDLER
  // ------------------------------
  const handlePurchase = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const confirmPurchase = () => {
    const item = selectedItem;
    if (!item) return;

    // COIN PACKS
    if ("amount" in item && item.id.includes("coins")) {
      player.addCoins(item.amount);
    }

    // GEM PACKS
    else if ("amount" in item && item.id.includes("gems")) {
      player.addGems(item.amount);
    }

    // VIP
    else if ("tier" in item) {
      player.setVIPTier(item.tier);
    }

    // BOOSTERS
    else if ("label" in item && item.id.includes("boost")) {
      player.addBooster(item.id);
    }

    // CATEGORY PACKS
    else if ("category" in item) {
      player.purchasePack(item.category);
    }

    // Animate reward burst
    setRewardTrigger(true);
    setTimeout(() => setRewardTrigger(false), 800);

    // Close modal
    setModalVisible(false);
    setSelectedItem(null);
  };

  return (
    <View style={styles.root}>
      <RewardBurst trigger={rewardTrigger} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Shop</Text>
        </View>

        {/* ------------------------------ */}
        {/* COIN PACKS */}
        {/* ------------------------------ */}
        <ShopSection title="Coins">
          {COIN_PACKS.map((pack) => (
            <CoinPackCard key={pack.id} pack={pack} onPress={handlePurchase} />
          ))}
        </ShopSection>

        {/* ------------------------------ */}
        {/* GEM PACKS */}
        {/* ------------------------------ */}
        <ShopSection title="Gems">
          {GEM_PACKS.map((pack) => (
            <GemPackCard key={pack.id} pack={pack} onPress={handlePurchase} />
          ))}
        </ShopSection>

        {/* ------------------------------ */}
        {/* VIP SUBSCRIPTIONS */}
        {/* ------------------------------ */}
        <ShopSection title="VIP Membership">
          {VIP_SUBSCRIPTIONS.map((pack) => (
            <VIPCard key={pack.id} pack={pack} onPress={handlePurchase} />
          ))}
        </ShopSection>

        {/* ------------------------------ */}
        {/* BOOSTERS */}
        {/* ------------------------------ */}
        <ShopSection title="Boosters">
          {BOOSTER_PACKS.map((pack) => (
            <BoosterCard key={pack.id} pack={pack} onPress={handlePurchase} />
          ))}
        </ShopSection>

        {/* ------------------------------ */}
        {/* CATEGORY PREMIUM PACKS */}
        {/* ------------------------------ */}
        <ShopSection title="Category Packs">
          {CATEGORY_PACKS.map((pack) => (
            <CategoryPackCard key={pack.id} pack={pack} onPress={handlePurchase} />
          ))}
        </ShopSection>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* PURCHASE MODAL */}
      <PurchaseModal
        visible={modalVisible}
        item={selectedItem}
        onConfirm={confirmPurchase}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },

  scroll: {
    padding: 20,
    paddingBottom: 60,
  },

  header: {
    marginBottom: 20,
  },

  backText: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FFD700",
  },
});



