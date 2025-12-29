import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { quickModes } from "@/modes/quickModes";
import { useQuickGameStore } from "@/store/useQuickGameStore";

export default function ModeSelectScreen() {
  const router = useRouter();

  const category = useQuickGameStore((s) => s.category);

  // Safety: if user somehow lands here without a category
  if (!category) {
    router.replace("./categorySelect");
    return null;
  }

  const startMode = (modeKey: string) => {
    const { initGame } = useQuickGameStore.getState();

    initGame(modeKey, category);

    router.replace("./game");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Game Mode</Text>

      {Object.entries(quickModes).map(([key, mode]) => {
        // ❌ Skip legacy "categories" mode
        if (key === "categories") return null;

        return (
          <Pressable
            key={key}
            style={styles.card}
            onPress={() => startMode(key)}
          >
            <Text style={styles.label}>{mode.label}</Text>

            <Text style={styles.sub}>
              {mode.globalTimer
                ? `${mode.globalTimer / 1000}s total`
                : `${mode.perQuestionTimer / 1000}s per question`}
            </Text>

            {mode.lives && (
              <Text style={styles.sub}>Lives: {mode.lives}</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#0B0B0B",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFD700",
    marginBottom: 14,
    textAlign: "center",
  },

  card: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#1A1A1A",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#333",
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },

  sub: {
    fontSize: 12,
    color: "#AAA",
    marginTop: 3,
  },
});
