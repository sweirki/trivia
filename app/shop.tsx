// app/shop.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native";
import Purchases, { PurchasesPackage } from "react-native-purchases";

export default function Shop() {
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);

  // 🛍️ Load offerings from RevenueCat
  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current && offerings.current.availablePackages.length > 0) {
          setPackages(offerings.current.availablePackages);
        }
      } catch (err) {
        console.warn("RevenueCat error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOfferings();
  }, []);

  // 💳 Handle purchases
  const handlePurchase = async (pack: PurchasesPackage) => {
    try {
      const { purchaserInfo } = await Purchases.purchasePackage(pack);
      Alert.alert("Purchase successful!", `You bought ${pack.product.title}`);
      // 🔮 Phase 6D: update user coins here
    } catch (err: any) {
      if (!err.userCancelled) {
        Alert.alert("Purchase failed", err.message);
      }
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💰 Enchanted Bazaar</Text>

      <FlatList
        data={packages}
        keyExtractor={(item) => item.identifier}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handlePurchase(item)}>
            <Text style={styles.cardTitle}>{item.product.title}</Text>
            <Text style={styles.price}>{item.product.priceString}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0A0A0F", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#FFFFFF", marginBottom: 20 },
  card: {
    backgroundColor: "#161632",
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    width: 280,
    alignItems: "center",
  },
  cardTitle: { color: "#FFFFFF", fontSize: 18, marginBottom: 5 },
  price: { color: "#00BFFF", fontSize: 16, fontWeight: "600" },
});