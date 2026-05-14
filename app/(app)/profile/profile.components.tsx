import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { Text } from "@/theme";
import GoldCard from "@/components/GoldCard";
import SectionHeader from "@/components/SectionHeader";

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <GoldCard variant="default" padding="md" style={profileStyles.section}>
      <SectionHeader title={title} />
      {children}
    </GoldCard>
  );
}

export function Grid({ children }: { children: ReactNode }) {
  return <View style={profileStyles.grid}>{children}</View>;
}

export function Tile({
  title,
  sub,
  onPress,
}: {
  title: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <GoldCard
      pressable
      onPress={onPress}
      variant="soft"
      padding="md"
      style={profileStyles.tile}
      accessibilityLabel={title}
    >
      <Text style={profileStyles.tileTitle} numberOfLines={2}>
        {title}
      </Text>
      <Text style={profileStyles.tileSub} numberOfLines={2}>
        {sub}
      </Text>
    </GoldCard>
  );
}

export function Stat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <GoldCard variant="soft" padding="sm" style={profileStyles.stat}>
      <Text style={profileStyles.statValue}>{value}</Text>
      <Text style={profileStyles.statLabel}>{label}</Text>
    </GoldCard>
  );
}

export const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
  },

  profileBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
  },

  content: {
    padding: 20,
    paddingBottom: 48,
  },

  heroCard: {
    backgroundColor: "rgba(20,28,46,0.92)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#24304C",
    padding: 18,
    marginBottom: 14,
  },

  profileHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },

  profileHeaderText: {
    flex: 1,
    minWidth: 0,
  },

 avatarFrame: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 2,
    borderColor: "#F6C453",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

avatar: {
  width: "100%",
  height: "100%",
  borderRadius: 47,
},

  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#F6C453",
  },

  sub: {
    fontSize: 11,
    color: "#9AA3B2",
    marginTop: 4,
  },

  identityBadgeRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginTop: 10,
  },

  identityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#1B243A",
    borderWidth: 1,
    borderColor: "#24304C",
  },

  identityBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#F6C453",
  },

  vipProfileBadge: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },

  vipProfileBadgeActive: {
    backgroundColor: "rgba(246, 196, 83, 0.16)",
    borderColor: "#F6C453",
  },

  vipProfileBadgeLocked: {
    backgroundColor: "#141C2E",
    borderColor: "#24304C",
  },

  vipProfileText: {
    fontSize: 12,
    fontWeight: "900",
  },

  vipProfileTextActive: {
    color: "#F6C453",
  },

  vipProfileTextLocked: {
    color: "#9AA3B2",
  },

  vipProfileSub: {
    marginTop: 2,
    fontSize: 10,
    color: "#9AA3B2",
  },

  seasonBanner: {
    width: "100%",
    backgroundColor: "#1A1424",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#5E4A1F",
    marginTop: 14,
  },

  seasonBannerLabel: {
    color: "#F6C453",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },

  seasonBannerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 8,
  },

  seasonBannerBody: {
    color: "#B7BFD2",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 8,
  },

  xpBar: {
    marginTop: 14,
    width: "100%",
    height: 10,
    backgroundColor: "#1B243A",
    borderRadius: 8,
    overflow: "hidden",
  },

  xpFill: {
    height: "100%",
    backgroundColor: "#F6C453",
  },

  xpText: {
    marginTop: 5,
    fontSize: 10,
    color: "#9AA3B2",
  },

  accountBox: {
    backgroundColor: "#141C2E",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#24304C",
    marginBottom: 14,
    alignItems: "center",
  },

  accountText: {
    fontSize: 11,
    color: "#9AA3B2",
    textAlign: "center",
  },

  accountSub: {
    marginTop: 2,
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
  },

  accountButtonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },

  accountButton: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: "#1B243A",
    borderWidth: 1,
    borderColor: "#24304C",
  },

  accountButtonText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#F6C453",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  stat: {
    flex: 1,
    backgroundColor: "#141C2E",
    borderRadius: 14,
    paddingVertical: 11,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#24304C",
  },

  statValue: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  statLabel: {
    marginTop: 2,
    fontSize: 11,
    color: "#9AA3B2",
  },

  section: {
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 10,
  },

  identityRow: {
    flexDirection: "row",
    gap: 10,
  },

  identityCard: {
    flex: 1,
    backgroundColor: "#141C2E",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#24304C",
  },

  identityValue: {
    color: "#F6C453",
    fontSize: 18,
    fontWeight: "900",
  },

  identityLabel: {
    color: "#9AA3B2",
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  tile: {
    width: "48%",
    backgroundColor: "#141C2E",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#24304C",
  },

  tileTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#F6C453",
  },

  tileSub: {
    marginTop: 4,
    fontSize: 10,
    color: "#9AA3B2",
  },

  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#1B243A",
    borderWidth: 1,
    borderColor: "#24304C",
  },

  pillText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#F6C453",
  },

  futurePrestigeCard: {
    marginTop: 12,
    backgroundColor: "#171423",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#40305E",
  },

  futurePrestigeLabel: {
    color: "#BBD7FF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },

  futurePrestigeTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 8,
  },

  futurePrestigeBody: {
    color: "#B7BFD2",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 8,
  },

  historyRow: {
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#24304C",
  },

  historyText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "800",
  },

  historyDate: {
    marginTop: 2,
    fontSize: 12,
    color: "#9AA3B2",
  },

  empty: {
    fontSize: 11,
    color: "#9AA3B2",
    lineHeight: 17,
  },
});

