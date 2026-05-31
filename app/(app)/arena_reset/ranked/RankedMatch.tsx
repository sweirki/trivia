import React, { useEffect, useMemo, useRef, useState } from "react";
import { ImageBackground, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useArenaStore } from "@/arena/store/useArenaStore";
import { useArenaOpponentAI } from "@/arena/store/useArenaOpponentAI";
import { useArenaRivalHistoryStore } from "@/arena/store/useArenaRivalHistoryStore";
import { feedback } from "@/feedback";
import { LinearGradient } from "expo-linear-gradient";

const RANKED_VS_BACKGROUND = require("../../../../assets/images/arena/ranked/ranked_vs_background.webp");
const RIVAL_CARD_ART = require("../../../../assets/images/arena/ranked/rival_card_art.webp");
const RANKED_MATCH_HEADER = require("../../../../assets/images/arena/ranked/ranked_match_header.webp");

const QUESTION_TIME = 12;
const INTRO_COUNTDOWN_START = 1;


type RankedQuestion = {
  text?: string;
  question?: string;
  answers?: string[];
  options?: string[];
  correct?: string;
  correctAnswer?: string;
};

type RivalRevealState = "idle" | "thinking" | "correct" | "wrong" | "timeout";

const RIVALS = [
  "ShadowFox",
  "MindStrike",
  "QuizNova",
  "NovaIQ",
  "BlitzKing",
];

export default function RankedMatch() {
  const { daily } = useLocalSearchParams<{ daily?: string }>();
  const questions = useArenaStore((state) => state.questions);
  const currentQuestionIndex = useArenaStore((state) => state.currentQuestionIndex);
  const matchState = useArenaStore((state) => state.matchState);
  const startRankedMatch = useArenaStore((state) => state.startRankedMatch);
  const updatePlayerScore = useArenaStore((state) => state.updatePlayerScore);
  const updateOpponentScore = useArenaStore((state) => state.updateOpponentScore);
  const nextQuestion = useArenaStore((state) => state.nextQuestion);
  const opponent = useArenaStore((state) => state.opponent);

  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [introVisible, setIntroVisible] = useState(true);
  const [introCountdown, setIntroCountdown] = useState(INTRO_COUNTDOWN_START);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [rivalReveal, setRivalReveal] = useState<RivalRevealState>("idle");

  const answeredRef = useRef(false);
  const matchStartedRef = useRef(false);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q = questions[currentQuestionIndex] as RankedQuestion | undefined;
  const questionText = typeof q?.text === "string" ? q.text : typeof q?.question === "string" ? q.question : "";
  const answers = Array.isArray(q?.answers) ? q.answers : Array.isArray(q?.options) ? q.options : [];
  const correctAnswer = typeof q?.correct === "string" ? q.correct : typeof q?.correctAnswer === "string" ? q.correctAnswer : "";
  const blocked = !q || !questionText || answers.length === 0 || !correctAnswer;

  const fallbackRivalName = useMemo(() => {
    const index = Math.floor(Math.random() * RIVALS.length);
    return RIVALS[index];
  }, []);
  const rivalName = opponent?.name ?? fallbackRivalName;
  const rivalTitle = opponent?.title ?? "AI Rival";
  const rivalStyle = opponent?.style ?? "Adaptive pressure";
  const rivalProfile = useArenaRivalHistoryStore((state) => state.getRivalProfile(rivalName));
  const rivalryLabel = rivalProfile
    ? `Series ${rivalProfile.wins}-${rivalProfile.losses}-${rivalProfile.draws} • ${rivalProfile.lastOutcome === "win" ? "You won last duel" : rivalProfile.lastOutcome === "loss" ? "Rival won last duel" : "Last duel was a draw"}`
    : "First recorded duel";

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
    }, 350);

    return () => clearInterval(interval);
  }, [introVisible]);

  useEffect(() => {
    if (introVisible) return;
    if (matchStartedRef.current) return;

    // Only create a new ranked match when there is no active question set.
    // Previous builds restarted during countdown/loading and wiped real scores.
    if (questions.length > 0) return;
    if (matchState === "finished") return;

    matchStartedRef.current = true;
    startRankedMatch().finally(() => {
      matchStartedRef.current = false;
    });
  }, [introVisible, matchState, questions.length, startRankedMatch]);

  const resolveRankedTurn = (isCorrect: boolean, answerLabel?: string) => {
    if (!q) return;
    if (answeredRef.current) return;

    answeredRef.current = true;
    setSelectedAnswer(answerLabel ?? null);
    setRivalReveal("thinking");

    if (isCorrect) {
      updatePlayerScore(1);
    }

    const decision = useArenaOpponentAI.getState().getAnswerForQuestion(currentQuestionIndex);
    const revealDelay = Math.max(180, Math.min(decision.delayMs, 520));

    revealTimeoutRef.current = setTimeout(() => {
      if (!decision.willAnswer) {
        setRivalReveal("timeout");
      } else if (decision.correct) {
        updateOpponentScore(1);
        setRivalReveal("correct");
      } else {
        setRivalReveal("wrong");
      }

      advanceTimeoutRef.current = setTimeout(() => {
        setSelectedAnswer(null);
        setRivalReveal("idle");
        nextQuestion();
      }, 220);
    }, revealDelay);
  };

  useEffect(() => {
    if (introVisible) return;
    if (matchState !== "in-match") return;
    if (!q) return;

    answeredRef.current = false;
    setTimeLeft(QUESTION_TIME);
    setSelectedAnswer(null);
    setRivalReveal("idle");

    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);

          if (!answeredRef.current) {
            feedback.suddenDeath();
            resolveRankedTurn(false);
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
  ]);

  const routedToResultRef = useRef(false);

  useEffect(() => {
    if (matchState !== "finished") return;
    if (routedToResultRef.current) return;

    routedToResultRef.current = true;
  

    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);

    router.replace({
      pathname: "/(app)/arena_reset/ranked/RankedResult",
      params: daily === "1" ? { daily: "1" } : undefined,
    });
  }, [daily, matchState]);

  const handleAnswer = (answer: string) => {
    if (!q) return;
    if (answeredRef.current) return;

    const isCorrect = answer === correctAnswer;

    if (isCorrect) {
      if (timeLeft <= 2) {
        feedback.arenaClutch();
      } else {
        feedback.correct();
      }
    } else {
      feedback.wrong();
    }

    resolveRankedTurn(isCorrect, answer);
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
              <Text style={styles.playerSub}>{rivalTitle}</Text>
              <Text style={styles.rivalRecordText}>{rivalryLabel}</Text>
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
        <View style={styles.blockedState}>
          <Text style={styles.loadingText}>Loading ranked battle...</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => startRankedMatch()}
            activeOpacity={0.9}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ImageBackground source={RANKED_MATCH_HEADER} resizeMode="cover" imageStyle={styles.matchHeaderImage} style={styles.matchHeader}>
            <LinearGradient pointerEvents="none" colors={["rgba(3,8,18,0.16)", "rgba(3,8,18,0.72)"]} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFillObject} />
            <Text style={styles.matchLabel}>RANKED ARENA</Text>
            <Text style={styles.header}>
              Question {currentQuestionIndex + 1}/{questions.length}
            </Text>
            <Text style={styles.rivalText}>Opponent: {rivalName} • {rivalStyle}</Text>
            <Text style={styles.rivalRecordText}>{rivalryLabel}</Text>
          </ImageBackground>

          <Text style={styles.timer}>⏳ {timeLeft}s</Text>

          <View style={[styles.rivalStatusCard, rivalReveal !== "idle" && styles.rivalStatusActive]}>
            <Text style={styles.rivalStatusLabel}>{rivalName}</Text>
            <Text style={styles.rivalStatusText}>
              {rivalReveal === "thinking"
                ? "Rival thinking…"
                : rivalReveal === "correct"
                  ? "Rival answered correctly"
                  : rivalReveal === "wrong"
                    ? "Rival missed"
                    : rivalReveal === "timeout"
                      ? "Rival timed out"
                      : "Waiting for your answer"}
            </Text>
          </View>

          <Text style={styles.question}>{questionText}</Text>

          {answers.map((ans: string) => (
            <TouchableOpacity
              key={ans}
              style={[
                styles.answerButton,
                selectedAnswer === ans && styles.answerButtonSelected,
                selectedAnswer && selectedAnswer !== ans && styles.answerButtonDimmed,
              ]}
              onPress={() => handleAnswer(ans)}
              activeOpacity={0.85}
              disabled={answeredRef.current}
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
    paddingTop: 76,
    paddingHorizontal: 16,
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
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  introTitle: {
    color: "#fff",
    fontSize: 30,
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

  rivalRecordText: {
    color: "#8FEAFF",
    fontSize: 10.5,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 4,
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
    fontSize: 11,
    lineHeight: 19,
  },

  countdownBig: {
    color: "#FFD54F",
    fontSize: 32,
    fontWeight: "900",
    marginTop: 22,
  },

  matchHeader: {
    backgroundColor: "#0A1830",
    overflow: "hidden",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(143,230,255,0.22)",
    padding: 12,
    marginBottom: 10,
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
    fontSize: 11,
    fontWeight: "900",
  },

  rivalText: {
    color: "#aaa8bc",
    fontSize: 11,
    marginTop: 5,
  },

  timer: {
    color: "#FF5C7A",
    fontSize: 11,
    textAlign: "center",
    marginVertical: 8,
    fontWeight: "900",
  },

  rivalStatusCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(143,230,255,0.18)",
    backgroundColor: "rgba(9,24,45,0.82)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },

  rivalStatusActive: {
    borderColor: "rgba(143,230,255,0.44)",
    backgroundColor: "rgba(13,38,68,0.94)",
  },

  rivalStatusLabel: {
    color: "#8FEAFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },

  rivalStatusText: {
    color: "#E7F8FF",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
  },

  question: {
    color: "#fff",
    fontSize: 11,
    marginVertical: 8,
    textAlign: "center",
    lineHeight: 15,
    fontWeight: "800",
  },

  answerButton: {
    backgroundColor: "rgba(16,35,61,0.94)",
    padding: 9,
    borderRadius: 14,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(143,230,255,0.18)",
  },

  answerButtonSelected: {
    borderColor: "rgba(143,230,255,0.72)",
    backgroundColor: "rgba(25,72,103,0.96)",
  },

  answerButtonDimmed: {
    opacity: 0.55,
  },

  answerText: {
    color: "#fff",
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
    fontWeight: "700",
  },

  blockedState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  retryButton: {
    marginTop: 18,
    backgroundColor: "#F7C948",
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },

  retryText: {
    color: "#071226",
    fontSize: 16,
    fontWeight: "900",
  },
});





