import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { common } from '../src/lib/theme';
import { db } from '../src/lib/firebase'; // just to trigger init

export default function Index() {
  console.log("✅ App loaded");

  useEffect(() => {
    const tryLoad = async () => {
      try {
        console.log("🔄 Firebase runtime check...");
        // Optional: test Firestore access
        const status = db ? "ready" : "missing";
        console.log(`✅ Firestore is ${status}`);
      } catch (err) {
        console.log("❌ Firebase init failed:", err);
      }
    };

    tryLoad();
  }, []);

  return (
    <View style={[common.screen, { justifyContent: "space-between" }]}>
      <Text style={common.heading}>Mega-Wow Trivia</Text>
    </View>
  );
}