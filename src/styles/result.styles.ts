import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020616",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(1,4,16,0.34)",
  },

  arenaGlowTop: {
    position: "absolute",
    top: -85,
    left: -30,
    right: -30,
    height: 220,
    borderRadius: 220,
    backgroundColor: "rgba(41,139,255,0.18)",
  },

  arenaGlowMid: {
    position: "absolute",
    top: 120,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(83,41,255,0.13)",
  },

  arenaGlowBottom: {
    position: "absolute",
    right: -90,
    bottom: 35,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(245,196,81,0.14)",
  },

  confettiOne: {
    position: "absolute",
    top: 112,
    left: 72,
    width: 7,
    height: 13,
    borderRadius: 3,
    backgroundColor: "rgba(84,190,255,0.65)",
    transform: [{ rotate: "20deg" }],
  },

  confettiTwo: {
    position: "absolute",
    top: 154,
    right: 86,
    width: 8,
    height: 12,
    borderRadius: 3,
    backgroundColor: "rgba(188,107,255,0.62)",
    transform: [{ rotate: "-18deg" }],
  },

  confettiThree: {
    position: "absolute",
    top: 92,
    right: 142,
    width: 9,
    height: 9,
    borderRadius: 3,
    backgroundColor: "rgba(245,196,81,0.58)",
    transform: [{ rotate: "35deg" }],
  },

  safe: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 18,
  },

  headerBlock: {
    alignItems: "center",
    paddingTop: 2,
    marginBottom: 10,
  },

  emblemHaloOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    backgroundColor: "rgba(86,166,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(86,166,255,0.20)",
    shadowColor: "#56A6FF",
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },

  emblemHalo: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245,196,81,0.10)",
    borderWidth: 1.2,
    borderColor: "rgba(245,196,81,0.30)",
  },

  emblem: {
    width: 64,
    height: 64,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 2,
  },

  titleLine: {
    width: 42,
    height: 1,
    backgroundColor: "rgba(245,196,81,0.55)",
  },

  title: {
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
    color: "#F5C451",
    letterSpacing: 3.4,
    textShadowColor: "rgba(245,196,81,0.35)",
    textShadowRadius: 13,
  },

  score: {
    fontSize: 58,
    lineHeight: 62,
    fontWeight: "900",
    textAlign: "center",
    color: "#FFFFFF",
    textShadowColor: "rgba(86,190,255,0.72)",
    textShadowRadius: 20,
    marginTop: 2,
  },

  meta: {
    textAlign: "center",
    color: "#EAF2FF",
    fontSize: 13,
    fontWeight: "900",
    marginTop: -4,
    textTransform: "capitalize",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 5,
  },

  performanceStrip: {
    width: "100%",
    marginTop: 10,
    overflow: "hidden",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(6,16,38,0.90)",
    borderWidth: 1.3,
    borderColor: "rgba(72,205,255,0.70)",
    shadowColor: "#1FC7FF",
    shadowOpacity: 0.30,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },

  performanceGlow: {
    position: "absolute",
    top: -42,
    right: -50,
    width: 180,
    height: 130,
    borderRadius: 80,
    backgroundColor: "rgba(86,166,255,0.17)",
  },

  performanceBadge: {
    color: "#64D9FF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 3,
  },

  performanceTitle: {
    color: "#F5C451",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(245,196,81,0.22)",
    textShadowRadius: 10,
  },

  performanceText: {
    color: "#F2F6FF",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
    textAlign: "center",
    marginTop: 7,
  },

  dailyStrip: {
    marginTop: 10,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: "rgba(245,196,81,0.12)",
    borderWidth: 1,
    borderColor: "rgba(245,196,81,0.25)",
  },

  dailyTitle: {
    color: "#F5C451",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },

  dailyText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 2,
  },

  resultCard: {
    backgroundColor: "rgba(5,10,28,0.92)",
    borderRadius: 22,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.25,
    borderColor: "rgba(245,196,81,0.48)",
    shadowColor: "#56A6FF",
    shadowOpacity: 0.20,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  statTile: {
    flex: 1,
    minWidth: "47%",
    minHeight: 70,
    borderRadius: 17,
    paddingVertical: 9,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "rgba(10,23,54,0.90)",
  },

  correctTile: {
    borderWidth: 1.15,
    borderColor: "rgba(38,231,139,0.70)",
    shadowColor: "#27E88D",
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },

  wrongTile: {
    borderWidth: 1.15,
    borderColor: "rgba(255,82,118,0.64)",
    shadowColor: "#FF5276",
    shadowOpacity: 0.14,
    shadowRadius: 12,
  },

  statIconGreen: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(38,231,139,0.16)",
    borderWidth: 1,
    borderColor: "rgba(38,231,139,0.55)",
  },

  statIconRed: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,82,118,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,82,118,0.55)",
  },

  statIconPurple: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(185,82,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(185,82,255,0.55)",
  },

  statIconText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  statLabelGreen: {
    color: "#39F0A0",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
    marginBottom: 2,
  },

  statLabelRed: {
    color: "#FF627F",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
    marginBottom: 2,
  },

  statLabelPurple: {
    color: "#BC72FF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: 5,
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    textShadowColor: "rgba(255,255,255,0.25)",
    textShadowRadius: 8,
  },

  accuracyTile: {
    width: "100%",
    minHeight: 72,
    borderRadius: 17,
    paddingVertical: 10,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "rgba(38,9,75,0.52)",
    borderWidth: 1.15,
    borderColor: "rgba(185,82,255,0.72)",
    shadowColor: "#B852FF",
    shadowOpacity: 0.18,
    shadowRadius: 13,
  },

  accuracyCopy: {
    flex: 1,
  },

  accuracyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  accuracyValue: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    minWidth: 52,
  },

  accuracyTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.11)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  accuracyFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#9F4DFF",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
    marginVertical: 10,
  },

  rewardGrid: {
    flexDirection: "row",
    gap: 9,
    flexWrap: "wrap",
  },

  rewardPill: {
    flexGrow: 1,
    minWidth: "47%",
    minHeight: 66,
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "rgba(8,20,48,0.92)",
  },

  xpPill: {
    borderWidth: 1,
    borderColor: "rgba(38,193,255,0.65)",
    shadowColor: "#26C1FF",
    shadowOpacity: 0.14,
    shadowRadius: 12,
  },

  coinPill: {
    borderWidth: 1,
    borderColor: "rgba(245,196,81,0.60)",
    shadowColor: "#F5C451",
    shadowOpacity: 0.13,
    shadowRadius: 12,
  },

  gemPill: {
    borderWidth: 1,
    borderColor: "rgba(38,193,255,0.60)",
  },

  ticketPill: {
    borderWidth: 1,
    borderColor: "rgba(245,196,81,0.55)",
  },

  rewardIcon: {
    color: "#51D4FF",
    fontSize: 21,
    fontWeight: "900",
    textShadowColor: "rgba(81,212,255,0.45)",
    textShadowRadius: 12,
  },

  rewardIconGold: {
    color: "#F5C451",
    fontSize: 22,
    fontWeight: "900",
    textShadowColor: "rgba(245,196,81,0.45)",
    textShadowRadius: 12,
  },

  rewardLabelBlue: {
    color: "#45D5FF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginBottom: 2,
  },

  rewardLabelGold: {
    color: "#F5C451",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginBottom: 2,
  },

  rewardValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  motivationBox: {
    backgroundColor: "rgba(5,13,34,0.90)",
    borderRadius: 22,
    borderWidth: 1.1,
    borderColor: "rgba(86,166,255,0.45)",
    padding: 14,
    marginBottom: 14,
  },

  motivationTitle: {
    color: "#F5C451",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 3,
  },

  motivationText: {
    color: "#DCE7FF",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 16,
  },

  inlineOfferBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(5,13,34,0.93)",
    borderRadius: 18,
    borderWidth: 1.1,
    borderColor: "rgba(86,166,255,0.48)",
    paddingVertical: 11,
    paddingHorizontal: 11,
    marginBottom: 12,
    shadowColor: "#56A6FF",
    shadowOpacity: 0.12,
    shadowRadius: 14,
  },

  inlineOfferCrown: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245,196,81,0.15)",
    borderWidth: 1,
    borderColor: "rgba(245,196,81,0.65)",
  },

  inlineOfferCrownText: {
    color: "#F5C451",
    fontSize: 21,
    fontWeight: "900",
  },

  inlineOfferCopy: {
    flex: 1,
    minWidth: 0,
  },

  inlineOfferTitle: {
    color: "#F5C451",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 2,
  },

  inlineOfferText: {
    color: "#B9C7F6",
    fontSize: 12,
    fontWeight: "900",
  },

  inlineOfferArrow: {
    color: "#F5C451",
    fontSize: 28,
    fontWeight: "900",
    marginTop: -3,
  },

  launchPolishBox: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
    marginTop: 14,
    marginBottom: 4,
    padding: 14,
    borderRadius: 22,
    backgroundColor: "rgba(7,18,38,0.86)",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.18)",
    overflow: "hidden",
  },

  launchPolishSignal: {
    width: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,214,110,0.95)",
    shadowColor: "#FFD66E",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },

  launchPolishCopy: {
    flex: 1,
  },

  launchPolishEyebrow: {
    color: "#9FE7FF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: 4,
  },

  launchPolishTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
  },

  launchPolishText: {
    color: "rgba(223,236,255,0.82)",
    fontSize: 13,
    lineHeight: 18,
  },

  launchPolishHint: {
    color: "#FFD66E",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 8,
  },

  actions: {
    gap: 9,
  },

  primaryBtn: {
    height: 50,
    borderRadius: 17,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5C451",
    borderWidth: 1.5,
    borderColor: "rgba(255,236,158,0.95)",
    shadowColor: "#F5C451",
    shadowOpacity: 0.36,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },

  primaryShine: {
    position: "absolute",
    top: -22,
    left: 20,
    right: 20,
    height: 34,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.22)",
  },

  primaryText: {
    color: "#07101E",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
  },

  secondaryBtn: {
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(5,13,34,0.94)",
    borderWidth: 1.2,
    borderColor: "rgba(86,166,255,0.45)",
    shadowColor: "#56A6FF",
    shadowOpacity: 0.13,
    shadowRadius: 13,
  },

  secondaryText: {
    color: "#C6D8FF",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  offerOverlay: {
    flex: 1,
    backgroundColor: "rgba(1,4,14,0.82)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  offerBackdropGlow: {
    position: "absolute",
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor: "rgba(245,196,81,0.13)",
  },

  offerModal: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 28,
    padding: 16,
    backgroundColor: "rgba(13,20,42,0.98)",
    borderWidth: 1.4,
    borderColor: "rgba(245,196,81,0.34)",
    shadowColor: "#56A6FF",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },

  offerTopGlow: {
    position: "absolute",
    top: -72,
    alignSelf: "center",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(86,166,255,0.17)",
  },

  offerHeader: {
    alignItems: "center",
    paddingHorizontal: 6,
    paddingTop: 4,
  },

  offerEmblem: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
    backgroundColor: "rgba(245,196,81,0.12)",
    borderWidth: 1,
    borderColor: "rgba(245,196,81,0.28)",
  },

  offerEmblemText: {
    color: "#F5C451",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.8,
    textShadowColor: "rgba(245,196,81,0.35)",
    textShadowRadius: 10,
  },

  offerBadge: {
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "rgba(245,196,81,0.96)",
    marginBottom: 9,
    borderWidth: 1,
    borderColor: "rgba(255,230,150,0.75)",
  },

  offerBadgeText: {
    color: "#111827",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  offerTitle: {
    color: "#F5C451",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 6,
  },

  offerText: {
    color: "#DCE7FF",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 13,
  },

  offerValueCard: {
    borderRadius: 18,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 13,
    backgroundColor: "rgba(12,23,48,0.88)",
    borderWidth: 1,
    borderColor: "rgba(86,166,255,0.24)",
  },

  offerValueLabel: {
    color: "#8FCBFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: 3,
  },

  offerValueText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    textAlign: "center",
  },

  offerPrimaryBtn: {
    height: 50,
    borderRadius: 18,
    backgroundColor: "rgba(245,196,81,0.96)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "rgba(255,230,150,0.75)",
    shadowColor: "#F5C451",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },

  offerPrimaryText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
  },

  offerSecondaryBtn: {
    height: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.2,
    borderColor: "rgba(245,196,81,0.30)",
    backgroundColor: "rgba(13,20,42,0.90)",
  },

  offerSecondaryText: {
    color: "#F5C451",
    fontSize: 13,
    fontWeight: "900",
  },
});


