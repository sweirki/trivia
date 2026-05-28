import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070B18",
  },


  panicOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,40,40,0.18)",
  },

  screenShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.48)",
  },

  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 72,
    paddingBottom: 22,
  },

  header: {
    height: 70,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  hudPill: {
    minWidth: 82,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(10,18,34,0.88)",
    borderWidth: 1,
    borderColor: "rgba(245,185,66,0.16)",
    alignItems: "center",
  },

  hudLabel: {
    color: "#8FA3D8",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  hudValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 1,
  },

  timerOrb: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(12,20,40,0.92)",
    borderWidth: 3,
    borderColor: "#56A6FF",
    shadowColor: "#56A6FF",
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },

  timerOrbDanger: {
    borderColor: "#FF6262",
    shadowColor: "#FF6262",
  },

  timerText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },

  timerTextDanger: {
    color: "#FFB4B4",
  },

  modeOrb: {
    minWidth: 66,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245,185,66,0.12)",
    borderWidth: 1,
    borderColor: "rgba(245,185,66,0.28)",
    paddingHorizontal: 10,
  },

  modeOrbText: {
    color: "#F5B942",
    fontSize: 11,
    fontWeight: "900",
  },

  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 14,
    marginBottom: 14,
  },

  categoryChip: {
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7,
    backgroundColor: "rgba(245,185,66,0.13)",
    borderWidth: 1,
    borderColor: "rgba(245,185,66,0.25)",
  },

  categoryText: {
    color: "#F5B942",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  questionChip: {
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7,
    backgroundColor: "rgba(20,28,52,0.86)",
    borderWidth: 1,
    borderColor: "rgba(88,140,255,0.22)",
  },

  questionChipText: {
    color: "#DCE7FF",
    fontSize: 11,
    fontWeight: "900",
  },

  vipChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(245,185,66,0.16)",
    borderWidth: 1,
    borderColor: "rgba(245,185,66,0.28)",
  },

  vipChipText: {
    color: "#F5B942",
    fontSize: 10,
    fontWeight: "900",
  },



  momentumPanel: {
    minHeight: 76,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(9,18,38,0.86)",
    borderWidth: 1,
    borderColor: "rgba(245,185,66,0.20)",
  },

  momentumEyebrow: {
    color: "#8FA3D8",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: 3,
  },

  momentumTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.4,
  },

  multiplierBadge: {
    minWidth: 74,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "rgba(245,185,66,0.14)",
    borderWidth: 1,
    borderColor: "rgba(245,185,66,0.34)",
  },

  multiplierText: {
    color: "#F5B942",
    fontSize: 20,
    fontWeight: "900",
  },

  multiplierSubtext: {
    color: "#FFE4A3",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 1,
  },

  questionCard: {
    borderRadius: 24,
    padding: 20,
    minHeight: 160,
    justifyContent: "center",
    backgroundColor: "rgba(10,20,34,0.90)",
    borderWidth: 1.2,
    borderColor: "rgba(245,185,66,0.20)",
    overflow: "hidden",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.26,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  cardGlow: {
    position: "absolute",
    top: -50,
    right: -35,
    width: 125,
    height: 125,
    borderRadius: 63,
    backgroundColor: "rgba(86,166,255,0.08)",
  },



  questionMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  questionMetaText: {
    color: "#8FA3D8",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },

  question: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "900",
    marginBottom: 18,
  },

  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.09)",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#F5B942",
  },

  answers: {
    gap: 10,
  },

  answerBtn: {
    minHeight: 64,
    borderRadius: 20,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(7,26,38,0.94)",
    borderWidth: 1.2,
    borderColor: "rgba(86,166,255,0.22)",
    shadowColor: "#000",
    shadowOpacity: 0.20,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  answerLocked: {
    opacity: 0.68,
  },


  answerPressed: {
    transform: [{ scale: 0.985 }],
  },

  answerCorrect: {
    borderColor: "rgba(70,255,170,0.95)",
    backgroundColor: "rgba(25,80,55,0.92)",
  },

  answerWrong: {
    borderColor: "rgba(255,98,98,0.95)",
    backgroundColor: "rgba(70,18,18,0.92)",
  },

  answerBoosted: {
    borderColor: "rgba(245,196,81,0.55)",
  },

  answerLetter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    backgroundColor: "rgba(86,166,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(86,166,255,0.32)",
  },

  answerLetterText: {
    color: "#66B3FF",
    fontSize: 15,
    fontWeight: "900",
  },

  answerText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800",
  },

  answerArrow: {
    color: "#91A4D7",
    fontSize: 25,
    fontWeight: "800",
    marginLeft: 8,
  },

  answerFeedback: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    alignSelf: "stretch",
  },

  answerFeedbackCorrect: {
    backgroundColor: "rgba(34,197,94,0.14)",
    borderColor: "rgba(34,197,94,0.28)",
  },

  answerFeedbackWrong: {
    backgroundColor: "rgba(255,98,98,0.14)",
    borderColor: "rgba(255,98,98,0.30)",
  },

  answerFeedbackSudden: {
    backgroundColor: "rgba(245,185,66,0.16)",
    borderColor: "rgba(245,185,66,0.32)",
  },

  answerFeedbackText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 19,
  },


  bottomAtmosphere: {
    flex: 1,
    minHeight: 120,
    marginTop: 20,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 16,
    overflow: "hidden",
  },

  bottomGlowLeft: {
    position: "absolute",
    left: -90,
    bottom: -90,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(86,166,255,0.10)",
  },

  bottomGlowRight: {
    position: "absolute",
    right: -100,
    bottom: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,80,80,0.08)",
  },

  bottomHint: {
    color: "rgba(220,230,245,0.42)",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.6,
  },

  loading: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});









