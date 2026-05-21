import React, { useEffect, useMemo, useRef, useState } from "react";
import { ImageBackground, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useArenaStore } from "@/arena/store/useArenaStore";
import { feedback } from "@/feedback";
import { LinearGradient } from "expo-linear-gradient";

const RANKED_VS_BACKGROUND = require("../../../../assets/images/arena/ranked/ranked_vs_background.webp");
const RIVAL_CARD_ART = require("../../../../assets/images/arena/ranked/rival_card_art.webp");
const RANKED_MATCH_HEADER = require("../../../../assets/images/arena/ranked/ranked_match_header.webp");

const QUESTION_TIME = 15;
const INTRO_COUNTDOWN_START = 3;


type RankedQuestion = {
  text: string;
  answers: string[];
  correct: string;
};

const RIVALS = [
  "ShadowFox",
  "MindStrike",
  "QuizNova",
  "NovaIQ",
  "BlitzKing",
];

export default function RankedMatch() {
  const { daily } = useLocalSearchParams<{ daily?: string }>();
  const {
    questions,
    currentQuestionIndex,
    matchState,
    startRankedMatch,
    handlePlayerAnswer,
    handleAIDecision,
  } = useArenaStore();

  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [introVisible, setIntroVisible] = useState(true);
  const [introCountdown, setIntroCountdown] = useState(INTRO_COUNTDOWN_START);

  const answeredRef = useRef(false);
  const matchStartedRef = useRef(false);

  const q = questions[currentQuestionIndex] as RankedQuestion;
  const blocked = !q;

  const rivalName = useMemo(() => {
    const index = Math.floor(Math.random() * RIVALS.length);
    return RIVALS[index];
  }, []);

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

  useEffect(() => {
    if (introVisible) return;
    if (matchStartedRef.current) return;
    if (matchState !== "idle") return;

    matchStartedRef.current = true;
    startRankedMatch();
  }, [introVisible, matchState, startRankedMatch]);

  useEffect(() => {
    if (introVisible) return;
    if (matchState !== "in-match") return;
    if (!q) return;

    answeredRef.current = false;
    setTimeLeft(QUESTION_TIME);

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);

          if (!answeredRef.current) {
            answeredRef.current = true;
            feedback.suddenDeath();
            handlePlayerAnswer(false);
            handleAIDecision(currentQuestionIndex);
          }

          return 0;
        }

        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    introVisible,
    currentQuestionIndex,
    matchState,
    q,
    handlePlayerAnswer,
    handleAIDecision,
  ]);

  useEffect(() => {
    if (matchState === "finished") {
      router.replace({
        pathname: "/(app)/arena_reset/ranked/RankedResult",
        params: daily === "1" ? { daily: "1" } : undefined,
      });
    }
  }, [daily, matchState]);

  const handleAnswer = (answer: string) => {
    if (!q) return;
    if (answeredRef.current) return;

    answeredRef.current = true;

    const isCorrect = answer === q.correct;

    if (isCorrect) {
      if (timeLeft <= 2) {
        feedback.arenaClutch();
      } else {
        feedback.correct();
      }
    } else {
      feedback.wrong();
    }

    handlePlayerAnswer(isCorrect);
    handleAIDecision(currentQuestionIndex);
  };

  if (introVisible) {
    return (
      <View style={styles.container}>
        <ImageBackground source={RANKED_VS_BACKGROUND} resizeMode="cover" imageStyle={styles.introImage} style={styles.introCard}>
          <LinearGradient pointerEvents="none" colors={["rgba(3,8,18,0.12)", "rgba(3,8,18,0.58)", "rgba(3,8,18,0.92)"]} locations={[0,0.48,1]} style={StyleSheet.absoluteFillObject} />
          <Text style={styles.introLabel}>RANKED BATTLE</Text>
          <Text style={styles.introTitle}>VS</Text>

          <View style={styles.vsRow}>
            <View style={styles.playerCard}>
              <ImageBackground source={RIVAL_CARD_ART} resizeMode="cover" imageStyle={styles.playerArtImage} style={styles.playerArt} />
              <Text style={styles.avatar}>YOU</Text>
              <Text style={styles.playerName}>You</Text>
              <Text style={styles.playerSub}>Climb. Protect. Promote.</Text>
            </View>

            <View style={styles.playerCard}>
              <ImageBackground source={RIVAL_CARD_ART} resizeMode="cover" imageStyle={styles.playerArtImage} style={styles.playerArt} />
              <Text style={styles.avatar}>AI</Text>
              <Text style={styles.playerName}>{rivalName}</Text>
              <Text style={styles.playerSub}>AI Rival</Text>
            </View>
          </View>

          <View style={styles.stakesCard}>
            <Text style={styles.stakesTitle}>Ranked Stakes</Text>
            <Text style={styles.stakesText}>
              Win to gain SR. Lose and your climb slows. Every answer matters.
            </Text>
          </View>

          <Text style={styles.countdownBig}>
            {introCountdown > 0 ? introCountdown : "GO!"}
          </Text>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {blocked ? (
        <Text style={styles.loadingText}>Loading ranked battle...</Text>
      ) : (
        <>
          <ImageBackground source={RANKED_MATCH_HEADER} resizeMode="cover" imageStyle={styles.matchHeaderImage} style={styles.matchHeader}>
            <LinearGradient pointerEvents="none" colors={["rgba(3,8,18,0.16)", "rgba(3,8,18,0.72)"]} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFillObject} />
            <Text style={styles.matchLabel}>RANKED ARENA</Text>
            <Text style={styles.header}>
              Question {currentQuestionIndex + 1}
            </Text>
            <Text style={styles.rivalText}>Opponent: {rivalName}</Text>
          </ImageBackground>

          <Text style={styles.timer}>⏳ {timeLeft}s</Text>

          <Text style={styles.question}>{typeof q.text === "string" ? q.text : ""}</Text>

          {(Array.isArray(q.answers) ? q.answers : []).map((ans: string) => (
            <TouchableOpacity
              key={ans}
              style={styles.answerButton}
              onPress={() => handleAnswer(ans)}
              activeOpacity={0.85}
            >
              <Text style={styles.answerText}>{ans}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 20,
    backgroundColor: "#071226",
  },

  loadingText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    fontWeight: "700",
  },

  introCard: {
    backgroundColor: "#0A1830",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(247,211,106,0.62)",
    padding: 22,
    alignItems: "center",
  },

  introImage: {
    borderRadius: 24,
  },
  introLabel: {
    color: "#FFD54F",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  introTitle: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "900",
    marginBottom: 18,
  },

  vsRow: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },

  playerCard: {
    flex: 1,
    backgroundColor: "rgba(10,24,48,0.86)",
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(143,230,255,0.22)",
  },

  avatar: {
    fontSize: 15,
    marginBottom: 8,
  },

  playerArt: {
    width: "100%",
    height: 38,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  playerArtImage: {
    borderRadius: 12,
  },
  playerName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },

  playerSub: {
    color: "#aaa8bc",
    fontSize: 11,
    textAlign: "center",
    marginTop: 5,
  },

  stakesCard: {
    width: "100%",
    backgroundColor: "rgba(14,25,48,0.88)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(247,211,106,0.32)",
    padding: 14,
    marginTop: 4,
  },

  stakesTitle: {
    color: "#FFD54F",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 6,
  },

  stakesText: {
    color: "#E8DDB5",
    fontSize: 13,
    lineHeight: 19,
  },

  countdownBig: {
    color: "#FFD54F",
    fontSize: 54,
    fontWeight: "900",
    marginTop: 22,
  },

  matchHeader: {
    backgroundColor: "#0A1830",
    overflow: "hidden",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(143,230,255,0.22)",
    padding: 16,
    marginBottom: 18,
  },

  matchHeaderImage: {
    borderRadius: 20,
  },
  matchLabel: {
    color: "#FFD54F",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
  },

  header: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
  },

  rivalText: {
    color: "#aaa8bc",
    fontSize: 13,
    marginTop: 5,
  },

  timer: {
    color: "#FF5C7A",
    fontSize: 26,
    textAlign: "center",
    marginVertical: 15,
    fontWeight: "900",
  },

  question: {
    color: "#fff",
    fontSize: 20,
    marginVertical: 20,
    textAlign: "center",
    lineHeight: 28,
    fontWeight: "800",
  },

  answerButton: {
    backgroundColor: "rgba(16,35,61,0.94)",
    padding: 15,
    borderRadius: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(143,230,255,0.18)",
  },

  answerText: {
    color: "#fff",
    fontSize: 17,
    textAlign: "center",
    fontWeight: "700",
  },
});

