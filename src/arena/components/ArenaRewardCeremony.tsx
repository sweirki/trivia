import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { feedback } from "@/feedback";

type ArenaRewardStat = {
  label: string;
  value: string | number;
  accent?: string;
};

type ArenaRewardCeremonyProps = {
  modeLabel: string;
  badgeLabel: string;
  title: string;
  subtitle: string;
  accentColor?: string;
  gradientColors?: [string, string];
  stats: ArenaRewardStat[];
  reportTitle: string;
  reportText: string;
  recordLabel?: string | null;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
};

export default function ArenaRewardCeremony({
  modeLabel,
  badgeLabel,
  title,
  subtitle,
  accentColor = "#F7C948",
  gradientColors = ["#211705", "#101018"],
  stats,
  reportTitle,
  reportText,
  recordLabel,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
}: ArenaRewardCeremonyProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    feedback.reward();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setReady(true));
  }, [fadeAnim, pulseAnim]);

  return (
    <Animated.View style={[styles.wrap, { opacity: fadeAnim }]}>
      <LinearGradient colors={gradientColors} style={[styles.hero, { borderColor: `${accentColor}55` }]}>
        <Text style={[styles.eyebrow, { color: accentColor }]}>{modeLabel}</Text>

        <View style={[styles.badge, { backgroundColor: accentColor }]}>
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>

        {recordLabel ? (
          <Animated.View
            style={[
              styles.recordBanner,
              {
                borderColor: accentColor,
                transform: [{ scale: ready ? pulseAnim : 1 }],
              },
            ]}
          >
            <Text style={[styles.recordText, { color: accentColor }]}>
              {recordLabel}
            </Text>
          </Animated.View>
        ) : null}

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </LinearGradient>

      <View style={styles.statGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
              style={[styles.statValue, { color: stat.accent ?? accentColor }]}
            >
              {stat.value}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.panel, { borderColor: `${accentColor}24` }]}>
        <Text style={styles.panelTitle}>{reportTitle}</Text>
        <Text style={styles.panelText}>{reportText}</Text>
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: accentColor }]}
        onPress={() => {
          feedback.tap();
          onPrimary();
        }}
        activeOpacity={0.9}
      >
        <Text style={styles.primaryText}>{primaryLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => {
          feedback.tap();
          onSecondary();
        }}
        activeOpacity={0.85}
      >
        <Text style={styles.secondaryText}>{secondaryLabel}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
  },
  hero: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 10,
  },
  badgeText: {
    color: "#06131D",
    fontSize: 10,
    fontWeight: "900",
  },
  recordBanner: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  recordText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
    marginBottom: 4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    lineHeight: 18,
  },
  statGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#151520",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  statLabel: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "900",
    marginTop: 7,
  },
  panel: {
    backgroundColor: "#11111A",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  panelTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
  },
  panelText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 12,
    lineHeight: 17,
  },
  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 8,
  },
  primaryText: {
    color: "#06131D",
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryBtn: {
    backgroundColor: "#191925",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  secondaryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});



