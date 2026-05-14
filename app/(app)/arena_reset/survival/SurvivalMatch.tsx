import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useArenaStore } from "@/arena/store/useArenaStore";
import { feedback } from "@/feedback";

const BASE_QUESTION_TIME = 12;
const INTRO_COUNTDOWN_START = 3;

type SurvivalQuestion = {
  text?: string;
  question?: string;
  answers?: string[];
  correct?: string;
  correctAnswer?: string;
};

function getRoundTime(round: number) {
  if (round >= 15) return 7;
  if (round >= 10) return 8;
  if (round >= 6) return 10;
  return BASE_QUESTION_TIME;
}

function getDangerLevel(round: number) {
  if (round >= 15) return "EXTREME";
  if (round >= 10) return "DANGER";
  if (round >= 6) return "HEATING UP";
  return "STABLE";
}

function getDangerColor(level: string) {
  if (level === "EXTREME") return "#FF335F";
  if (level === "DANGER") return "#FF7043";
  if (level === "HEATING UP") return "#FFD54F";
  return "#4FC3F7";
}

export default function SurvivalMatch() {
  const {
    questions,
    currentQuestionIndex,
    matchState,
    startSurvival,
    survivalCorrect,
    survivalWrong,
  } = useArenaStore();

  const [introVisible, setIntroVisible] = useState(true);
  const [introCountdown, setIntroCountdown] = useState(INTRO_COUNTDOWN_START);
  const [timeLeft, setTimeLeft] = useState(BASE_QUESTION_TIME);

  const answeredRef = useRef(false);
  const startedRef = useRef(false);
  const routedRef = useRef(false);

  const roundNumber = currentQuestionIndex + 1;
  const q = questions?.[currentQuestionIndex] as SurvivalQuestion | undefined;

  const questionText =
    typeof q?.text === "string"
      ? q.text
      : typeof q?.question === "string"
        ? q.question
        : "";
  const answers = Array.isArray(q?.answers) ? q.answers : [];
  const correctAnswer =
    typeof q?.correct === "string"
      ? q.correct
      : typeof q?.correctAnswer === "string"
        ? q.correctAnswer
        : "";

  const roundTime = useMemo(() => getRoundTime(roundNumber), [roundNumber]);
  const dangerLevel = useMemo(() => getDangerLevel(roundNumber), [roundNumber]);
  const dangerColor = useMemo(() => getDangerColor(dangerLevel), [dangerLevel]);

  const blocked = !q || answers.length === 0;

  // ---------------------------------
  // INTRO COUNTDOWN
  // ---------------------------------
  useEffect(() => {
    if (!introVisible) return;

    setIntroCountdown(INTRO_COUNTDOWN_START);

    const interval = setInterval(() => {
      setIntroCountdown((value) => {
        if (value <= 1) {
          clearInterval(interval);
          setIntroVisible(false);
          return 0;
        }

        return value - 1;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [introVisible]);

  // ---------------------------------
  // START SURVIVAL ONCE ONLY
  // ---------------------------------
  useEffect(() => {
    if (introVisible) return;
    if (startedRef.current) return;
    if (matchState !== "idle") return;

    startedRef.current = true;
    startSurvival();
  }, [introVisible, matchState, startSurvival]);

  // ---------------------------------
  // RESULT ROUTE
  // ---------------------------------
  useEffect(() => {
    if (matchState !== "finished") return;
    if (routedRef.current) return;

    routedRef.current = true;
    router.replace("/(app)/arena_reset/survival/SurvivalResult");
  }, [matchState]);

  // ---------------------------------
  // TIMER SETUP
  // Do NOT call survivalWrong inside setTimeLeft updater.
  // React throws "Cannot update a component while rendering..." if Zustand updates there.
  // ---------------------------------
  useEffect(() => {
    if (introVisible) return;
    if (matchState !== "in-match") return;
    if (blocked) return;

    answeredRef.current = false;
    setTimeLeft(roundTime);

    const interval = setInterval(() => {
      setTimeLeft((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [
    blocked,
    currentQuestionIndex,
    introVisible,
    matchState,
    roundTime,
  ]);

  // ---------------------------------
  // TIMEOUT HANDLER
  // Safe place to call survivalWrong after timeLeft has updated.
  // ---------------------------------
  useEffect(() => {
    if (introVisible) return;
    if (matchState !== "in-match") return;
    if (blocked) return;
    if (timeLeft > 0) return;
    if (answeredRef.current) return;

    answeredRef.current = true;
    survivalWrong();
  }, [
    blocked,
    introVisible,
    matchState,
    survivalWrong,
    timeLeft,
  ]);

  // ---------------------------------
  // ANSWER HANDLER
  // ---------------------------------
  const handleAnswer = (answer: string) => {
    if (answeredRef.current) return;
    if (!correctAnswer) return;

    answeredRef.current = true;

    if (answer === correctAnswer) {
      if (timeLeft <= 2 || roundNumber >= 10) {
        feedback.arenaClutch();
      } else {
        feedback.correct();
      }
      survivalCorrect();
    } else {
      feedback.wrong();
      survivalWrong();
    }
  };

  // ---------------------------------
  // INTRO RENDER
  // ---------------------------------
  if (introVisible) {
    return (
      <View style={styles.container}>
        <View style={styles.introCard}>
          <Text style={styles.introLabel}>SURVIVAL ARENA</Text>
          <Text style={styles.introTitle}>Last As Long As You Can</Text>

          <View style={styles.survivalIconSlot}>
            <Text style={styles.survivalIcon}>💀</Text>
          </View>

          <Text style={styles.introBody}>
            Every wrong answer can end the run. Timers get tighter as danger rises.
          </Text>

          <Text style={styles.countdownBig}>
            {introCountdown > 0 ? introCountdown : "GO!"}
          </Text>
        </View>
      </View>
    );
  }

  // ---------------------------------
  // MATCH RENDER
  // ---------------------------------
  return (
    <View style={styles.container}>
      {blocked ? (
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Preparing survival run…</Text>
        </View>
      ) : (
        <>
          <View style={[styles.headerCard, { borderColor: dangerColor }]}>
            <Text style={[styles.dangerLabel, { color: dangerColor }]}>
              {dangerLevel}
            </Text>

            <Text style={styles.header}>Survival Round {roundNumber}</Text>

            <Text style={styles.headerSub}>
              Keep answering correctly. The arena gets harsher every wave.
            </Text>
          </View>

          <View style={styles.statusRow}>
            <View style={styles.statusBox}>
              <Text style={styles.statusValue}>{roundNumber}</Text>
              <Text style={styles.statusLabel}>Round</Text>
            </View>

            <View style={styles.statusBox}>
              <Text style={[styles.statusValue, { color: dangerColor }]}>
                {timeLeft}s
              </Text>
              <Text style={styles.statusLabel}>Timer</Text>
            </View>

            <View style={styles.statusBox}>
              <Text style={styles.statusValue}>∞</Text>
              <Text style={styles.statusLabel}>Run</Text>
            </View>
          </View>

          <Text style={styles.question}>{questionText}</Text>

          {answers.map((answer: string) => (
            <TouchableOpacity
              key={answer}
              style={styles.answerButton}
              onPress={() => handleAnswer(answer)}
              activeOpacity={0.86}
            >
              <Text style={styles.answerText}>{answer}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.pressureCard}>
            <Text style={styles.pressureTitle}>Survival Pressure</Text>
            <Text style={styles.pressureText}>
              {dangerLevel === "STABLE"
                ? "Build the run. Early rounds are your setup window."
                : dangerLevel === "HEATING UP"
                  ? "The timer is tightening. Stay sharp."
                  : dangerLevel === "DANGER"
                    ? "One mistake can crush the run. Focus."
                    : "Extreme pressure. Every tap matters now."}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 88,
    paddingHorizontal: 16,
    backgroundColor: "#070713",
  },

  introCard: {
    backgroundColor: "#151521",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FF7043",
    padding: 18,
    alignItems: "center",
  },

  introLabel: {
    color: "#FF7043",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  introTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },

  survivalIconSlot: {
    width: 74,
    height: 74,
    borderRadius: 22,
    backgroundColor: "#241013",
    borderWidth: 1,
    borderColor: "#FF7043",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 18,
  },

  survivalIcon: {
    fontSize: 36,
  },

  introBody: {
    color: "#cfc7d9",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },

  countdownBig: {
    color: "#FFD54F",
    fontSize: 44,
    fontWeight: "900",
    marginTop: 18,
  },

  loadingBox: {
    backgroundColor: "#151521",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#27273B",
  },

  loadingText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
  },

  headerCard: {
    backgroundColor: "#151521",
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 10,
  },

  dangerLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
  },

  header: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },

  headerSub: {
    color: "#aaa8bc",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },

  statusBox: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#26344f",
  },

  statusValue: {
    color: "#FFD54F",
    fontSize: 18,
    fontWeight: "900",
  },

  statusLabel: {
    color: "#8d95aa",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
  },

  question: {
    color: "#FFFFFF",
    fontSize: 18,
    marginVertical: 12,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "800",
  },

  answerButton: {
    backgroundColor: "#1c1c29",
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "#2b2b3f",
  },

  answerText: {
    color: "#FFFFFF",
    fontSize: 15,
    textAlign: "center",
    fontWeight: "700",
  },

  pressureCard: {
    backgroundColor: "#21160e",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#6d4b1e",
    marginTop: 12,
  },

  pressureTitle: {
    color: "#FFD54F",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 6,
  },

  pressureText: {
    color: "#d5cabc",
    fontSize: 13,
    lineHeight: 19,
  },
});

