import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#071226",
  },

  content: {
    paddingHorizontal: 17,
    paddingTop: 20,
    paddingBottom: 64,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },

  avatarWrap: {
    width: 50,
    height: 50,
    borderRadius: 18,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(143,183,217,0.34)",
  },

  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "#12223A",
  },

  economyCluster: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  currencyChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(18,31,54,0.88)",
    borderWidth: 1,
    borderColor: "rgba(169,218,255,0.22)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  currencyIcon: {
    width: 18,
    height: 18,
    resizeMode: "contain",
    marginRight: 4,
  },

  currencyText: {
    color: "#D5EFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  vipBadge: {
    backgroundColor: "#8FE6FF",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },

  vipText: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "900",
  },

  vipBadgeLocked: {
    backgroundColor: "rgba(31,45,74,0.96)",
    borderWidth: 1,
    borderColor: "rgba(169,218,255,0.22)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },

  vipTextLocked: {
    color: "#AEB7C8",
    fontSize: 11,
    fontWeight: "900",
  },

  hero: {
    minHeight: 236,
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#0A1830",
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.26)",
    shadowColor: "#000",
    shadowOpacity: 0.38,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 9,
  },

  heroImage: {
    resizeMode: "cover",
    opacity: 1,
  },

  heroAtmosphereShade: {
    ...StyleSheet.absoluteFillObject,
  },

  heroTopSheen: {
    ...StyleSheet.absoluteFillObject,
  },

  heroShade: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 19,
    paddingTop: 25,
  },

  heroKicker: {
    color: "#BFE8FF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 6,
  },

  heroTitle: {
    color: "#F4FAFF",
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.45,
  },

  heroSub: {
    color: "#C2D3E8",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 5,
    marginBottom: 12,
    maxWidth: "74%",
  },

  progressPill: {
    backgroundColor: "rgba(8,18,38,0.68)",
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.28)",
    borderRadius: 20,
    padding: 11,
    marginTop: 10,
  },

  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  progressLevel: {
    color: "#A9CBE7",
    fontSize: 14,
    fontWeight: "900",
  },

  progressXp: {
    color: "#E9EDF7",
    fontSize: 11,
    fontWeight: "800",
  },

  progressBar: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(190,231,255,0.18)",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#8FE6FF",
  },

  streakText: {
    color: "#A9CBE7",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 8,
    textAlign: "right",
  },

  sectionHeader: {
    marginBottom: 10,
  },

  sectionTitle: {
    color: "#F4FAFF",
    fontSize: 18,
    fontWeight: "900",
  },

  sectionHint: {
    color: "#9CB1CB",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },

  modeCard: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#0A172C",
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.22)",
    shadowColor: "#000",
    shadowOpacity: 0.48,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 9,
  },

  modeCardLarge: {
    height: 140,
    marginBottom: 16,
  },

  modeCardCompact: {
    width: "48%",
    height: 118,
    marginBottom: 14,
    borderColor: "rgba(190,231,255,0.28)",
  },

  cardGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#8FE6FF",
    borderRadius: 24,
  },

  modeSurface: {
    flex: 1,
    backgroundColor: "#0A1930",
    overflow: "hidden",
    justifyContent: "center",
  },

  modeAccentBar: {
    position: "absolute",
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: "#8FB7D9",
    opacity: 0.54,
  },

  modeArt: {
    flex: 1,
  },

  modeArtImage: {
    resizeMode: "cover",
  },

  modeMaterialSheen: {
    ...StyleSheet.absoluteFillObject,
  },

  modeIconReveal: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "58%",
  },

  modeReadabilityShade: {
    ...StyleSheet.absoluteFillObject,
  },

  modeBottomVignette: {
    ...StyleSheet.absoluteFillObject,
  },

  modeOverlay: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },

  modeOverlayCompact: {
    padding: 13,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },

  modeCopy: {
    maxWidth: "64%",
  },

  modeTitle: {
    color: "#F4FAFF",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.35,
  },

 modeTitleCompact: {
  color: "#FFFFFF",
  fontSize: 17,
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowRadius: 8,
  },

  modeSub: {
    color: "#C1D6ED",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
  },

  modeSubCompact: {
    color: "#BDD4EC",
    fontSize: 11,
    textShadowColor: "rgba(0,0,0,0.86)",
    textShadowRadius: 6,
  },

  ctaPill: {
    marginTop: 13,
    alignSelf: "flex-start",
    backgroundColor: "#D7F3FF",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
    shadowColor: "#A9CBE7",
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },

  ctaText: {
    color: "#061223",
    fontSize: 12,
    fontWeight: "900",
  },

  redBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF3B30",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 2,
  },

  infoCard: {
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.22)",
    borderRadius: 22,
    padding: 16,
    marginTop: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.38,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },

  infoGoldGlow: {
    position: "absolute",
    top: -32,
    right: -18,
    width: 132,
    height: 88,
    borderRadius: 80,
    backgroundColor: "rgba(169,203,231,0.08)",
  },

  infoTitle: {
    color: "#CBEFFF",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 12,
    textShadowColor: "rgba(169,203,231,0.16)",
    textShadowRadius: 7,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  infoLabel: {
    color: "#F2F7FF",
    fontSize: 13,
    fontWeight: "900",
  },

  infoSub: {
    color: "#A8BAD4",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3,
  },

  infoValue: {
    color: "#D5EFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  greenText: {
    color: "#35F2A1",
  },

  bar: {
    height: 9,
    borderRadius: 999,
    backgroundColor: "rgba(190,231,255,0.16)",
    marginTop: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.14)",
  },

  barFill: {
    height: "100%",
    backgroundColor: "#8FE6FF",
    shadowColor: "#A9CBE7",
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },

  claimButton: {
    marginTop: 14,
    backgroundColor: "#8FE6FF",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },

  claimText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "900",
  },

  claimedText: {
    color: "#35F2A1",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 13,
  },

  achievementCard: {
    backgroundColor: "rgba(18,36,66,0.96)",
    borderWidth: 1,
    borderColor: "rgba(245,185,66,0.28)",
    borderRadius: 22,
    padding: 18,
    marginTop: 14,
  },

  achievementTitle: {
    color: "#A9CBE7",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 5,
  },

  achievementText: {
    color: "#D2DEF0",
    fontSize: 13,
    fontWeight: "700",
  },

  levelUpOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  levelUpCard: {
    backgroundColor: "#12223A",
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.26)",
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 30,
    alignItems: "center",
  },

  levelUpTitle: {
    color: "#A9CBE7",
    fontSize: 22,
    fontWeight: "900",
  },

  levelUpText: {
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 6,
  },


  modeArtLayer: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  quickArtLayer: {
    transform: [{ scale: 1.03 }],
  },

  compactArtLayer: {
    transform: [{ scale: 1.08 }],
  },

  shopArtLayer: {
    opacity: 1,
    transform: [{ scale: 1.18 }],
  },

  dailyArtLayer: {
    opacity: 1,
    transform: [{ scale: 1.13 }],
  },

  arenaArtLayer: {
    opacity: 0.98,
    transform: [{ scale: 1.11 }],
  },
  challengeArtLayer: {
  opacity: 1,
},

  lobbyArtLayer: {
    opacity: 0.98,
    transform: [{ scale: 1.12 }],
  },

  iconSpotlight: {
    position: "absolute",
    right: -18,
    top: 8,
    width: 132,
    height: 100,
    borderRadius: 72,
    opacity: 0.34,
  },

  iconSpotlightShop: {
    opacity: 0.348,
    right: -10,
    top: 4,
    width: 142,
    height: 108,
  },

  iconSpotlightDaily: {
    opacity: 0.344,
  },

  infoSheen: {
    ...StyleSheet.absoluteFillObject,
  },

  infoCornerGlow: {
    position: "absolute",
    top: -34,
    right: -18,
    width: 132,
    height: 88,
    borderRadius: 80,
    backgroundColor: "rgba(36,200,255,0.12)",
  },

  infoCornerGlowToday: {
    backgroundColor: "rgba(47,224,162,0.14)",
  },

  infoCornerGlowWeek: {
    backgroundColor: "rgba(143,183,217,0.14)",
  },

  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
});




