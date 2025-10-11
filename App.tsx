import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useEffect } from "react";
import Purchases from "react-native-purchases";

export default function App() {
  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        // 🔧 Initialize RevenueCat
        await Purchases.configure({
          apiKey: "goog_VxWIcKYrBKsAiKLsapekpTBCraO",
        });

        // 🛍️ Try fetching offerings
        const offerings = await Purchases.getOfferings();

        if (offerings.current && offerings.current.availablePackages.length > 0) {
          console.log("✅ Offerings found:", offerings.current.availablePackages);
        } else {
          console.log("⚠️ No offerings found. Check RevenueCat setup.");
        }
      } catch (e) {
        console.error("❌ RevenueCat error:", e);
      }
    };

    initRevenueCat();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>MEGA WOW Trivia — RevenueCat Test</Text>
      <Text style={styles.note}>
        Check Metro logs for offerings (coins_pack_small / coins_pack_big)
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  note: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
});
