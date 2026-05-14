import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import React from "react";
import { s } from "@/arena/theme/arenaSizing";

export function ArenaModeCard({
  icon,
  title,
  subtitle,
  tag,
  onPress,
  testID,
}: {
  icon: string;
  title: string;
  subtitle: string;
  tag: string;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <TouchableOpacity testID={testID} style={styles.modeCard} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.modeIconBox}>
        <Text style={styles.modeIcon}>{icon}</Text>
      </View>

      <View style={styles.modeCopy}>
        <View style={styles.modeTitleRow}>
          <Text style={styles.modeTitle}>{title}</Text>
          <Text style={styles.modeTag}>{tag}</Text>
        </View>

        <Text style={styles.modeSubtitle}>{subtitle}</Text>
      </View>

      <Text style={styles.modeArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  modeCard: {
    width: "100%",
    backgroundColor: "#161625",
    borderRadius: s(18),
    padding: s(14),
    marginBottom: s(12),
    borderWidth: 1,
    borderColor: "#292945",
    flexDirection: "row",
    alignItems: "center",
  },
  modeIconBox: {
    width: s(48),
    height: s(48),
    borderRadius: s(15),
    backgroundColor: "#231d39",
    alignItems: "center",
    justifyContent: "center",
    marginRight: s(12),
  },
  modeIcon: { fontSize: s(24) },
  modeCopy: { flex: 1 },
  modeTitleRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: s(7) },
  modeTitle: { color: "white", fontSize: s(16), fontWeight: "900" },
  modeTag: {
    color: "#FFD36B",
    backgroundColor: "#2a2232",
    borderRadius: s(999),
    paddingHorizontal: s(7),
    paddingVertical: s(3),
    fontSize: s(9),
    fontWeight: "900",
    overflow: "hidden",
  },
  modeSubtitle: { color: "#aaa", marginTop: s(5), fontSize: s(12), lineHeight: s(17) },
  modeArrow: { color: "#FFD36B", fontSize: s(28), fontWeight: "900" },
});
