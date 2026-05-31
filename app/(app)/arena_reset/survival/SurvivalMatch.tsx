import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useArenaStore } from "@/arena/store/useArenaStore";
import { feedback } from "@/feedback";

const BASE_QUESTION_TIME = 10;
const INTRO_COUNTDOWN_START = 3;

const SURVIVAL_INTRO_ART = require("../../../../assets/images/arena/survival/survival_intro_hero.webp");
const SURVIVAL_MATCH_HEADER_ART = require("../../../../assets/images/arena/survival/survival_match_header.webp");
const SURVIVAL_PRESSURE_ART = require("../../../../assets/images/arena/survival/survival_pressure_panel.webp");

type SurvivalQuestion = {
  text?: string;
  question?: string;
  answers?: string[];
  correct?: string;
  correctAnswer?: string;
};

function getRoundTime(round: number) {
  if (round >= 15) return 6;
  if (round >= 10) return 7;
  if (round >= 6) return 8;
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
  const questions = useArenaStore((state) => state.questions);
  const currentQuestionIndex = useArenaStore((state) => state.currentQuestionIndex);
  const matchState = useArenaStore((state) => state.matchState);
  const startSurvival = useArenaStore((state) => state.startSurvival);
  const survivalCorrect = useArenaStore((state) => state.survivalCorrect);
  const survivalWrong = useArenaStore((state) => state.survivalWrong);

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
    }, 1000);

    return () => clearInterval(interval);
  }, [introVisible]);

  useEffect(() => {
    if (introVisible) return;
    if (startedRef.current) return;
    if (matchState !== "idle") return;

    startedRef.current = true;
    startSurvival();
  }, [introVisible, matchState, startSurvival]);

  useEffect(() => {
    if (matchState !== "finished") return;
    if (routedRef.current) return;

    routedRef.current = true;
    router.replace("/(app)/arena_reset/survival/SurvivalResult");
  }, [matchState]);

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
  }, [blocked, currentQuestionIndex, introVisible, matchState, roundTime]);

  useEffect(() => {
    if (introVisible) return;
    if (matchState !== "in-match") return;
    if (blocked) return;
    if (timeLeft > 0) return;
    if (answeredRef.current) return;

    answeredRef.current = true;
    survivalWrong();
  }, [blocked, introVisible, matchState, survivalWrong, timeLeft]);

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

  if (introVisible) {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={SURVIVAL_INTRO_ART}
          resizeMode="cover"
          style={styles.introCard}
          imageStyle={styles.introImage}
        >
          <LinearGradient
            pointerEvents="none"
            colors={[
              "rgba(2,6,16,0.18)",
              "rgba(2,8,20,0.58)",
              "rgba(2,6,16,0.95)",
            ]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFillObject}
          />

          <Text style={styles.introLabel}>SURVIVAL ARENA</Text>
          <Text style={styles.introTitle}>Last As Long As You Can</Text>
          <Text style={styles.introBody}>
            One wrong answer can end the run. Timers get tighter as danger rises.
          </Text>

          <View style={styles.countdownPlate}>
            <Text style={styles.countdownBig}>
              {introCountdown > 0 ? introCountdown : "GO!"}
            </Text>
          </View>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {blocked ? (
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Preparing survival run...</Text>
        </View>
      ) : (
        <>
          <ImageBackground
            source={SURVIVAL_MATCH_HEADER_ART}
            resizeMode="cover"
            style={[styles.headerCard, { borderColor: dangerColor }]}
            imageStyle={styles.headerImage}
          >
            <LinearGradient
              pointerEvents="none"
              colors={[
                "rgba(3,10,22,0.10)",
                "rgba(3,13,28,0.48)",
                "rgba(3,10,22,0.92)",
              ]}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFillObject}
            />

            <Text style={[styles.dangerLabel, { color: dangerColor }]}>
              {dangerLevel}
            </Text>
            <Text style={styles.header}>Survival Round {roundNumber}</Text>
            <Text style={styles.headerSub}>
              Keep answering correctly. The arena gets harsher every wave.
            </Text>
          </ImageBackground>

          <View style={styles.statusRow}>
            <View style={styles.statusBox}>
              <Text style={styles.statusValue}>{roundNumber}</Text>
              <Text style={styles.statusLabel}>Round</Text>
            </View>

            <View style={[styles.statusBox, { borderColor: dangerColor }]}>
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

          <ImageBackground
            source={SURVIVAL_PRESSURE_ART}
            resizeMode="cover"
            style={styles.pressureCard}
            imageStyle={styles.pressureImage}
          >
            <LinearGradient
              pointerEvents="none"
              colors={[
                "rgba(3,10,22,0.20)",
                "rgba(3,13,28,0.58)",
                "rgba(3,10,22,0.94)",
              ]}
              locations={[0, 0.55, 1]}
              style={StyleSheet.absoluteFillObject}
            />

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
          </ImageBackground>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 62,
    paddingHorizontal: 14,
    backgroundColor: "#061426",
  },

  introCard: {
    minHeight: 250,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,112,67,0.62)",
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#071426",
  },
  introImage: { borderRadius: 24 },
  introLabel: {
    color: "#FF7043",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 8,
  },
  introTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowRadius: 10,
  },
  introBody: {
    color: "#D8F2FF",
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 285,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 7,
  },
  countdownPlate: {
    marginTop: 28,
    minWidth: 88,
    minHeight: 74,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(3,12,26,0.62)",
    borderWidth: 1,
    borderColor: "rgba(255,112,67,0.45)",
  },
  countdownBig: {
    color: "#FFD54F",
    fontSize: 30,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowRadius: 8,
  },

  loadingBox: {
    backgroundColor: "#101B2D",
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
    minHeight: 70,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 10,
    marginBottom: 8,
    overflow: "hidden",
    backgroundColor: "#08182C",
    justifyContent: "flex-end",
  },
  headerImage: { borderRadius: 20 },
  dangerLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 7,
  },
  header: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowRadius: 9,
  },
  headerSub: {
    color: "#D8F2FF",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 6,
  },

  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  statusBox: {
    flex: 1,
    backgroundColor: "#0A2138",
    borderRadius: 15,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(79, 195, 247, 0.28)",
  },
  statusValue: {
    color: "#FFD54F",
    fontSize: 19,
    fontWeight: "900",
  },
  statusLabel: {
    color: "#9BAEC4",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 3,
  },

  question: {
    color: "#FFFFFF",
    fontSize: 14,
    marginVertical: 8,
    textAlign: "center",
    lineHeight: 19,
    fontWeight: "900",
  },
  answerButton: {
    backgroundColor: "#0B2B45",
    padding: 10,
    borderRadius: 13,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(79, 195, 247, 0.38)",
  },
  answerText: {
    color: "#FFFFFF",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "800",
  },

  pressureCard: {
    minHeight: 70,
    borderRadius: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255,112,67,0.38)",
    marginTop: 8,
    overflow: "hidden",
    backgroundColor: "#0F1E34",
    justifyContent: "flex-end",
  },
  pressureImage: { borderRadius: 15 },
  pressureTitle: {
    color: "#FFD54F",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 5,
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowRadius: 7,
  },
  pressureText: {
    color: "#D8F2FF",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 15,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowRadius: 6,
  },
});


