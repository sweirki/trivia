import { View, Text, StyleSheet } from "react-native";

type Props = {
  formatted: string;
  ended: boolean;
};

export function SeasonCountdown({ formatted, ended }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {ended ? "Season ended" : "Season ends in"}
      </Text>

      <Text style={[styles.value, ended && styles.ended]}>
        {ended ? "Rewards locked" : formatted}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
    color: "#FFFFFF", // ✅ white
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF", // ✅ white
  },
  ended: {
    color: "#FF6B6B", // red when ended
  },
});
