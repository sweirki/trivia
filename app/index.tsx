// app/index.tsx
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { common } from "../src/lib/theme";
import { BannerAd } from "../src/lib/adsManager";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../src/lib/firebase";
import { MotiView, MotiText } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { initRevenueCat } from "../src/lib/revenuecat"; // ✅ Added RevenueCat import

export default function Index() {
  const router = useRouter();
  const [isAdFree, setIsAdFree] = useState(false);
  const [coins, setCoins] = useState(0);
  const db = getFirestore(app);
  const auth = getAuth(app);

  // ✅ Initialize RevenueCat once
  useEffect(() => {
    initRevenueCat();
  }, []);

  // ✅ Load coins + adFree status
  useEffect(() => {
    const loadData = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (uid) {
          const ref = doc(db, "users", uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            if (data.adFree) setIsAdFree(true);
            if (data.coins) setCoins(data.coins);
          }
        } else {
          const local = await AsyncStorage.getItem("adFree");
          const localCoins = await AsyncStorage.getItem("coins");
          if (local === "true") setIsAdFree(true);
          if (localCoins) setCoins(parseInt(localCoins));
        }
      } catch (err) {
        console.warn("hub load error:", err);
      }
    };
    loadData();
  }, []);

  const menuItems = [
    { label: "Play Trivia", route: "/trivia" },
    { label: "Shop", route: "/shop" },
    { label: "Ladder", route: "/ladder" },
    { label: "Live", route: "/live" },
    { label: "Settings", route: "/settings" },
  ];

  return (
    <View style={[common.screen, { justifyContent: "space-between" }]}>
      <View style={{ alignItems: "center", width: "100%" }}>
        {/* 💰 Coin Counter + Ad-Free Badge */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: "90%",
            marginBottom: 10,
          }}
        >
          <MotiText
            from={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "timing", duration: 600 }}
            style={{
              color: "#FFD700",
              fontSize: 18,
              fontWeight: "bold",
            }}
          >
            💰 {coins} Coins
          </MotiText>

          {isAdFree && (
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 500 }}
              style={{
                backgroundColor: "#6B3FA0",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "bold" }}>
                💎 Ad-Free
              </Text>
            </MotiView>
          )}
        </View>

        <Text style={common.heading}> Mega-Wow Trivia </Text>

        {menuItems.map((item, idx) => {
          const isShop = item.label === "Shop";
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => router.push(item.route)}
              style={[
                common.button,
                isShop && { overflow: "hidden", position: "relative" },
              ]}
            >
              <Text style={common.buttonText}>{item.label}</Text>

              {/* ✨ Shimmer Effect for Shop */}
              {isShop && (
                <LinearGradient
                  colors={["transparent", "#ffffff55", "transparent"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    position: "absolute",
                    left: "-100%",
                    right: 0,
                    top: 0,
                    bottom: 0,
                  }}
                >
                  <MotiView
                    from={{ translateX: -200 }}
                    animate={{ translateX: 200 }}
                    transition={{
                      loop: true,
                      duration: 1800,
                      type: "timing",
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: "#ffffff22",
                    }}
                  />
                </LinearGradient>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ✅ Banner shows only if not ad-free */}
      {!isAdFree && (
        <View style={{ width: "100%", alignItems: "center", marginBottom: 4 }}>
          <BannerAd />
        </View>
      )}
    </View>
  );
}
