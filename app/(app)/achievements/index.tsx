import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useAchievementsStore } from "@/store/achievementsStore";

// Optional: if you created this earlier, use it.
// If you DON'T have it yet, either create it, or leave this import commented.
// import { ACHIEVEMENT_META } from "@/data/achievementMeta";

type AnyAch = {
  id: string;
  progress: number;
  target: number;
  unlocked: boolean;
  category?: string | null;
};

const safeNum = (n: any, fallback = 0) =>
  typeof n === "number" && Number.isFinite(n) ? n : fallback;

export default function AchievementsScreen() {
  const achievements = useAchievementsStore((s) => s.achievements);

  const list = useMemo(() => {
    const arr = (Object.values(achievements || {}) as AnyAch[]).map((a) => {
      const progress = safeNum(a.progress, 0);
      const target = Math.max(1, safeNum(a.target, 1)); // avoid divide-by-zero
      const unlocked = !!a.unlocked;

      const pctRaw = progress / target;
      const pct = Math.max(0, Math.min(1, pctRaw));
      const displayProgress = Math.min(progress, target);

      return {
        ...a,
        progress,
        target,
        unlocked,
        pct,
        displayProgress,
      };
    });

    // Sort: unlocked first, then highest progress %, then id
    arr.sort((a, b) => {
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      if (b.pct !== a.pct) return b.pct - a.pct;
      return String(a.id).localeCompare(String(b.id));
    });

    return arr;
  }, [achievements]);

  return (
   <ScrollView
  style={{ flex: 1, backgroundColor: "#000" }}
  contentContainerStyle={styles.container}
>

      <Text style={styles.title}>🏆 Achievements</Text>
      <Text style={styles.subtitle}>
        {list.filter((x) => x.unlocked).length} unlocked • {list.length} total
      </Text>

      {list.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No achievements yet</Text>
          <Text style={styles.emptyText}>
            Play a few matches and your first achievements will appear here.
          </Text>
        </View>
      )}

      {list.map((a) => {
        // If you have ACHIEVEMENT_META, swap title/desc like this:
        // const meta = ACHIEVEMENT_META[a.id];
        // const title = meta?.title ?? a.id;
        // const desc = meta?.description ?? "";
        const title = a.id;
        const desc = "";

        return (
          <View key={a.id} style={[styles.card, a.unlocked && styles.cardUnlocked]}>
            <View style={styles.rowTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {title}
                </Text>
                {!!desc && <Text style={styles.desc}>{desc}</Text>}
              </View>

              <View style={[styles.badge, a.unlocked ? styles.badgeUnlocked : styles.badgeLocked]}>
                <Text style={styles.badgeText}>
                  {a.unlocked ? "UNLOCKED" : "IN PROGRESS"}
                </Text>
              </View>
            </View>

            <View style={styles.progressRow}>
              <Text style={styles.progressText}>
                {a.displayProgress} / {a.target}
              </Text>
              <Text style={styles.percentText}>{Math.round(a.pct * 100)}%</Text>
            </View>

            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${a.pct * 100}%` }]} />
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 28,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 16,
    color: "#9aa0a6",
    fontSize: 13,
    fontWeight: "600",
  },

  emptyBox: {
    marginTop: 8,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#0f0f10",
    borderWidth: 1,
    borderColor: "#242424",
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  emptyText: {
    color: "#9aa0a6",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },

  card: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#0f0f10",
    borderWidth: 1,
    borderColor: "#242424",
    marginBottom: 12,
  },
  cardUnlocked: {
    borderColor: "#2f3a2f",
  },

  rowTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  desc: {
    marginTop: 4,
    color: "#9aa0a6",
    fontSize: 13,
    fontWeight: "600",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeUnlocked: {
    backgroundColor: "#102514",
    borderColor: "#2c6b39",
  },
  badgeLocked: {
    backgroundColor: "#151516",
    borderColor: "#2a2a2a",
  },
  badgeText: {
    color: "#d7d7d7",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.4,
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressText: {
    color: "#d7d7d7",
    fontSize: 13,
    fontWeight: "800",
  },
  percentText: {
    color: "#9aa0a6",
    fontSize: 12,
    fontWeight: "800",
  },

  barTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#1c1c1e",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#FFD700",
  },
});
