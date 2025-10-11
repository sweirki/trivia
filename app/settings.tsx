import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../src/lib/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../src/lib/firebase";
import { BannerAd } from "../src/lib/adsManager";
import { MotiView, MotiText } from "moti";
import Purchases from "react-native-purchases"; // ✅ new RevenueCat import

export default function Settings() {
  const router = useRouter();
  const [isAdFree, setIsAdFree] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState(0);
  const db = getFirestore(app);
  const auth = getAuth(app);

  // ⚙️ Replace this with your RevenueCat Public SDK key (Android key starts with "goog_")
  const REVENUECAT_API_KEY = "goog_kYOUR_REVENUECAT_API_KEY";

  // ✅ Load user's ad-free & coins
  useEffect(() => {
    const loadAdFree = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (uid) {
          const ref = doc(db, "users", uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            setIsAdFree(!!data.adFree);
            if (data.coins) setCoins(data.coins);
          }
        } else {
          const local = await AsyncStorage.getItem("adFree");
          const localCoins = await AsyncStorage.getItem("coins");
          setIsAdFree(local === "true");
          if (localCoins) setCoins(parseInt(localCoins));
        }
      } catch (err) {
        console.error("Ad-Free load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAdFree();
  }, []);

  // ✅ Initialize RevenueCat
  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
        console.log("✅ RevenueCat initialized");

        const info = await Purchases.getCustomerInfo();
        const adFree = !!info.entitlements.active["ad_free"];
        if (adFree) setIsAdFree(true);
      } catch (err) {
        console.warn("RevenueCat init failed:", err);
      }
    };
    initRevenueCat();
  }, []);

  // ✅ Handle purchase flow
  const handlePurchase = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages[0];
      if (!pkg) {
        Alert.alert("Unavailable", "No purchase packages found.");
        return;
      }

      const purchase = await Purchases.purchasePackage(pkg);
      if (purchase.customerInfo.entitlements.active["ad_free"]) {
        await grantAdFree();
      }
    } catch (err: any) {
      if (!err.userCancelled) {
        console.error("Purchase failed:", err);
        Alert.alert("Purchase Error", "Something went wrong. Please retry.");
      }
    }
  };

  // ✅ Grant Ad-Free after purchase
  const grantAdFree = async () => {
    try {
      const uid = auth.currentUser?.uid;
      setIsAdFree(true);
      if (uid) {
        const ref = doc(db, "users", uid);
        await setDoc(ref, { adFree: true }, { merge: true });
      } else {
        await AsyncStorage.setItem("adFree", "true");
      }
      Alert.alert("🎉 Purchase Successful", "Ads are now permanently disabled!");
    } catch (err) {
      console.error("Grant ad-free error:", err);
    }
  };

  // ✅ Toggle handler – for debug/dev
  const toggleAdFree = async (value: boolean) => {
    try {
      setIsAdFree(value);
      const uid = auth.currentUser?.uid;
      if (uid) {
        const ref = doc(db, "users", uid);
        await setDoc(ref, { adFree: value }, { merge: true });
      } else {
        await AsyncStorage.setItem("adFree", value ? "true" : "false");
      }
      Alert.alert(
        value ? "Ad-Free Enabled" : "Ads Restored",
        value
          ? "You have disabled ads. Enjoy uninterrupted play!"
          : "Ads are now enabled again."
      );
    } catch (err) {
      console.error("Ad-Free toggle error:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>⚙️ Settings</Text>
        <Text style={styles.info}>Loading preferences...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Settings</Text>

      {/* 💰 Coin Balance */}
      <MotiText
        from={{ opacity: 0, translateY: -5 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 700 }}
        style={styles.coinsText}
      >
        💰 Coins: {coins}
      </MotiText>

      {/* 💎 Ad-Free badge */}
      {isAdFree && (
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 500 }}
          style={styles.adFreeBadge}
        >
          <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "bold" }}>
            💎 Ad-Free Active
          </Text>
        </MotiView>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/legend")}
      >
        <Text style={styles.btnText}>🏆 Legend Hub</Text>
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>💰 Monetization</Text>

      {!isAdFree && (
        <View style={styles.bannerBox}>
          <BannerAd />
        </View>
      )}

      <View style={styles.switchRow}>
        <Text style={styles.label}>Ad-Free Mode</Text>
        <Switch
          value={isAdFree}
          onValueChange={toggleAdFree}
          trackColor={{ false: "#444", true: theme.colors.primary }}
          thumbColor={isAdFree ? "#fff" : "#888"}
        />
      </View>

      {!isAdFree && (
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: "#FFD700", borderWidth: 1, borderColor: "#FFF" },
          ]}
          onPress={handlePurchase}
        >
          <Text style={[styles.btnText, { color: "#000" }]}>
            🪙 Go Ad-Free (One-Time Purchase)
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.secondary }]}
        onPress={() => router.push("/")}
      >
        <Text style={styles.btnText}>🏠 Return Home</Text>
      </TouchableOpacity>

      <Text style={styles.info}>
        Manage your account, view your legend rank, purchase ad-free mode, and
        access all game features.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background ?? "#0A0A0F",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.primary ?? "#00BFFF",
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.accent ?? "#00BFFF",
    marginTop: 20,
    marginBottom: 10,
  },
  bannerBox: { marginVertical: 10, borderRadius: 10, overflow: "hidden" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.card ?? "#111",
    width: "80%",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  label: { color: theme.colors.text ?? "#FFFFFF", fontSize: 16, fontWeight: "500" },
  button: {
    backgroundColor: theme.colors.primary ?? "#00BFFF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginVertical: 8,
    width: "80%",
    alignItems: "center",
  },
  btnText: {
    color: theme.colors.buttonText ?? "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  info: {
    color: theme.colors.subtext ?? "#AAAAAA",
    fontSize: 14,
    marginTop: 20,
    textAlign: "center",
  },
  coinsText: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  adFreeBadge: {
    backgroundColor: "#6B3FA0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
});
