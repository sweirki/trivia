// /app/play/game.tsx — A+++++ UPGRADE
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ImageBackground,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTournamentStore } from "@/arena/store/useTournamentStore";
import { useLocalSearchParams } from "expo-router";
import { getGameCompletionReward, getDayKeyUTC, getWeekKeyUTC } from "@/economy/economyRules";

import { useQuickGameStore } from "@/store/useQuickGameStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useHistoryStore } from "@/store/historyStore";

import { useAuthStore } from "@/store/useAuthStore";


import { onGameFinished } from "@/achievements/achievementHooks";
import { useChallengesStore } from "@/challenges/store/useChallengesStore";
import { feedback, preloadFeedbackSounds } from "@/feedback";
import { trackEvent } from "@/observability";

const GAME_BG = require("../../../assets/premium/atmospheres/premium_question_bg.webp");

export default function GameScreen() {
  const insets = useSafeAreaInsets();
 const gameStartRef = useRef<number>(Date.now());
 const didFinalizeRef = useRef(false);
 const answerFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const router = useRouter();
  
  const submitMatchResult = useTournamentStore(
    (s) => s.submitMatchResult
  );
  
  const mode = useQuickGameStore((s) => s.mode);
  const category = useQuickGameStore((s) => s.category);
  const idx = useQuickGameStore((s) => s.idx);
  const questions = useQuickGameStore((s) => s.questions);
  const score = useQuickGameStore((s) => s.score);
  const streak = useQuickGameStore((s) => s.streak);
  const timeLeft = useQuickGameStore((s) => s.timeLeft);
  const gameOver = useQuickGameStore((s) => s.gameOver);
  const handleAnswer = useQuickGameStore((s) => s.handleAnswer);
  const { id: matchId, challengeId, runId } = useLocalSearchParams<{
  id?: string;
  challengeId?: string;
  runId?: string;
}>();

  const current = questions[idx];
  const runKey = `${runId ?? "direct"}:${mode ?? "none"}:${category ?? "none"}:${questions.length}:${questions[0]?.id ?? "empty"}`;

  const vipTier = usePlayerStore((s) => s.vipTier);
  const boosts = usePlayerStore((s) => s.activeBoosts);

  const [locked, setLocked] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerFeedback, setAnswerFeedback] = useState<{
    text: string;
    tone: "correct" | "wrong" | "sudden";
  } | null>(null);


  useEffect(() => {
    return () => {
      if (answerFeedbackTimeoutRef.current) {
        clearTimeout(answerFeedbackTimeoutRef.current);
      }
    };
  }, []);


  useEffect(() => {
    const t = setTimeout(() => {
      void preloadFeedbackSounds(["tap", "correct", "wrong"]);
    }, 300);

    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!gameOver && questions.length > 0) {
      didFinalizeRef.current = false;
      gameStartRef.current = Date.now();
    }
  }, [runKey, gameOver, questions.length]);

  // ---------------------------------------------------------
  // ANIMATIONS
  // ---------------------------------------------------------
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [idx]);

 useEffect(() => {
  const t = setTimeout(() => {
    void trackEvent("game_started", {
      mode: mode ?? "unknown",
      questionCount: questions.length,
      hasChallenge: Boolean(challengeId),
      hasTournamentMatch: Boolean(matchId),
    });
  }, 1200);

  return () => clearTimeout(t);
}, [challengeId, matchId, mode, questions.length, runKey]);

  const timerPulse = useRef(new Animated.Value(1)).current;

 useEffect(() => {
  if (mode !== "timed60" && mode !== "timed90") return;

  const loop = Animated.loop(
    Animated.sequence([
      Animated.timing(timerPulse, {
        toValue: 1.15,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(timerPulse, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ])
  );

  loop.start();
  return () => loop.stop();
}, [mode]);


  const lowTimePulse = useRef(new Animated.Value(1)).current;
  const panicOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if ((timeLeft ?? 0) <= 5 && (mode === "timed60" || mode === "timed90")) {
      Animated.sequence([
        Animated.timing(lowTimePulse, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(lowTimePulse, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [timeLeft]);

  
  useEffect(() => {
    if (!((mode === "timed60" || mode === "timed90")) || (timeLeft ?? 0) > 10) {
      panicOpacity.stopAnimation();
      panicOpacity.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(panicOpacity, {
          toValue: 0.22,
          duration: 450,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(panicOpacity, {
          toValue: 0.04,
          duration: 450,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => {
      loop.stop();
    };
 }, [mode, (timeLeft ?? 0) <= 10]);


  // ---------------------------------------------------------
 // ---------------------------------------------------------
// GAME OVER — navigate first, process heavy work after
// ---------------------------------------------------------
useEffect(() => {
  if (!gameOver || didFinalizeRef.current) return;

  didFinalizeRef.current = true;

  const quick = useQuickGameStore.getState();
  const latestScore = quick.score;
  const totalQuestions = quick.questions.length;
  const correctCount = quick.answerHistory.filter((answer) => answer.correct).length;
  const latestMode = quick.mode;
  const latestStreak = quick.streak;

  const accuracy = totalQuestions === 0 ? 0 : correctCount / totalQuestions;

  const reward = getGameCompletionReward({
    mode: latestMode,
    totalQuestions,
    correct: correctCount,
    accuracy,
    perfect: totalQuestions > 0 && correctCount === totalQuestions,
  });

  useQuickGameStore.setState(() => ({
    earnedXP: reward.xp,
    earnedCoins: reward.coins,
    earnedGems: reward.gems,
    earnedTickets: reward.tickets,
  }));

  const player = usePlayerStore.getState();

  if (quick.gameContext === "tournament") {
    const totalQ = totalQuestions || 10;
    const botScore = Math.max(
      0,
      Math.min(totalQ, latestScore + (Math.floor(Math.random() * 3) - 2))
    );

    if (matchId) {
      const tournamentState = useTournamentStore.getState();
      const tournamentBracket = tournamentState.bracket;
      const allTournamentMatches = tournamentBracket
        ? [
            ...tournamentBracket.qualifiers,
            ...tournamentBracket.semifinals,
            ...(tournamentBracket.final ? [tournamentBracket.final] : []),
          ]
        : [];
      const targetMatch = allTournamentMatches.find((m) => m.id === matchId);
      const currentUserUid =
        useAuthStore.getState().user?.uid ??
        (player as any).uid ??
        null;

      const playerAIsBot = targetMatch?.playerAUid?.startsWith("bot-") ?? false;
      const playerBIsBot = targetMatch?.playerBUid?.startsWith("bot-") ?? false;

      const humanIsA =
        targetMatch?.playerAUid === currentUserUid ||
        (!playerAIsBot && playerBIsBot);
      const humanIsB =
        targetMatch?.playerBUid === currentUserUid ||
        (!playerBIsBot && playerAIsBot);

      submitMatchResult(
        matchId,
        humanIsB && !humanIsA ? botScore : latestScore,
        humanIsB && !humanIsA ? latestScore : botScore
      );
    }
  }

  if (reward.xp || reward.coins || reward.gems || reward.tickets) {
    player.applyReward(reward.xp, reward.coins, reward.gems, reward.tickets);
  }

  useHistoryStore.getState().addResult({
    mode: latestMode ?? "classic",
    category: quick.category ?? undefined,
    score: latestScore,
    questions: totalQuestions,
    correct: correctCount,
    totalQuestions,
    correctCount,
    accuracy,
    won: latestScore > 0,
    xp: reward.xp,
    coins: reward.coins,
  } as any);

  player.incrementGamesPlayed();

  if (latestScore > 0) {
    player.incrementWins();
  }

  if (challengeId) {
    useChallengesStore
      .getState()
      .completeChallenge(String(challengeId), latestScore);
  }

  if (latestMode === "daily") {
    quick.setDailyResult({
      accuracy,
      passed: accuracy >= 0.8,
      perfect: accuracy === 1,
    });

    const store = usePlayerStore.getState();
    const currentWeek = getWeekKeyUTC();
    const today = getDayKeyUTC();
    const lastDailyPlayDate = (store.weekly as any).lastDailyPlayDate ?? null;

    if (store.weekly.weekKey !== currentWeek) {
      store.setWeekly({
        weekKey: currentWeek,
        progress: 1,
        claimed: false,
        lastDailyPlayDate: today,
      } as any);
    } else if (lastDailyPlayDate !== today) {
      store.setWeekly({
        ...store.weekly,
        progress: store.weekly.progress + 1,
        lastDailyPlayDate: today,
      } as any);
    }
  }

  const uid = useAuthStore.getState().user?.uid ?? null;
  const playerState = usePlayerStore.getState();

  void onGameFinished({
    userId: uid,
    won: latestScore > 0,
    correctCount,
    totalQuestions,
    durationMs: Date.now() - gameStartRef.current,
    totalGamesPlayed: playerState.totalGamesPlayed,
    totalWins: playerState.totalWins,
    winStreak: latestStreak,
  });

  void trackEvent("game_completed", {
    mode: latestMode ?? "classic",
    score: latestScore,
    totalQuestions,
    correctCount,
    accuracy,
    durationMs: Date.now() - gameStartRef.current,
    earnedXP: reward.xp,
    earnedCoins: reward.coins,
    earnedGems: reward.gems,
    earnedTickets: reward.tickets,
    challenge: Boolean(challengeId),
    tournament: Boolean(matchId),
  });

  router.replace({ pathname: "/(app)/play/(screens)/result", params: { runId: runId ?? `${Date.now()}` } } as any);
}, [gameOver, matchId, challengeId, router, submitMatchResult, runId, runKey]);


  // ---------------------------------------------------------
  // SAFE ANSWER HANDLER — NEW A++++ logic
  // ---------------------------------------------------------
  const onAnswer = async (ans: string) => {
    if (locked || gameOver || !current) return;

    if (answerFeedbackTimeoutRef.current) {
      clearTimeout(answerFeedbackTimeoutRef.current);
      answerFeedbackTimeoutRef.current = null;
    }

    const correctAnswerIndex = Number(current.correctAnswerIndex);
    const wasCorrect = current.answers[correctAnswerIndex] === ans;
    const answerIndex = current.answers.indexOf(ans);
    const isSuddenDeathLoss = mode === "sudden" && !wasCorrect;

    setLocked(true);
    setSelectedAnswer(ans);
    setAnswerFeedback(
      isSuddenDeathLoss
        ? {
            text: "Sudden Death over — one wrong answer ends the round!",
            tone: "sudden",
          }
        : wasCorrect
          ? {
              text: "Correct! Good job.",
              tone: "correct",
            }
          : {
              text: "Not quite. Keep going!",
              tone: "wrong",
            }
    );

    if (isSuddenDeathLoss) {
      feedback.suddenDeath();
    } else if (wasCorrect) {
      feedback.correct();
    } else {
      feedback.wrong();
    }

    const feedbackDelay = isSuddenDeathLoss ? 350 : 120;

    answerFeedbackTimeoutRef.current = setTimeout(() => {
      const handledCorrect = handleAnswer(ans);

    // Deferred analytics for performance.
// void trackEvent("answer_selected", {
//   mode: mode ?? "unknown",
//   questionIndex: idx,
//   answerIndex,
//   correct: handledCorrect,
//   streak: useQuickGameStore.getState().streak,
// });

      if (
        handledCorrect &&
        useQuickGameStore.getState().streak > 0 &&
        useQuickGameStore.getState().streak % 5 === 0
      ) {
        feedback.streak();
      }

      setAnswerFeedback(null);
      setLocked(false);
      setSelectedAnswer(null);
      answerFeedbackTimeoutRef.current = null;
    }, feedbackDelay);
  };


  // ---------------------------------------------------------
  // UI LAYER
  // ---------------------------------------------------------
  const isTimedMode = mode === "timed60" || mode === "timed90";
  const totalQuestions = questions.length || 1;
  const progressPercent = `${Math.min(100, ((idx + 1) / totalQuestions) * 100)}%`;
  const categoryLabel = String(category ?? "Trivia").toUpperCase();
  const modeLabel = String(mode ?? "classic").replace("timed60", "60s").replace("timed90", "90s").toUpperCase();

  return (
    <ImageBackground
      testID="screen-game"
      source={GAME_BG}
      style={styles.container}
      resizeMode="cover"
    >
<View pointerEvents="none" style={styles.topGlow} />
      <View style={styles.screenShade} />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.panicOverlay,
          {
            opacity: panicOpacity,
          },
        ]}
      />

      {!current ? (
        <View testID="screen-game-loading" style={styles.center}>
          <Text style={styles.loading}>Loading…</Text>
        </View>
      ) : (
        <View style={[styles.content, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.header}>
            <View style={styles.hudPill}>
              <Text style={styles.hudLabel}>SCORE</Text>
              <Text style={styles.hudValue}>{score}</Text>
            </View>

            {isTimedMode ? (
              <Animated.View
                style={[
                  styles.timerOrb,
                  { transform: [{ scale: timerPulse }, { scale: lowTimePulse }] },
                 (timeLeft ?? 0) <= 5 && styles.timerOrbDanger
                ]}
              >
                <Text style={[styles.timerText,(timeLeft ?? 0) <= 5 && styles.timerTextDanger]}>
                  {timeLeft}
                </Text>
              </Animated.View>
            ) : (
              <View style={styles.modeOrb}>
                <Text style={styles.modeOrbText}>{modeLabel}</Text>
              </View>
            )}

            <View style={styles.hudPill}>
              <Text style={styles.hudLabel}>STREAK</Text>
              <Text style={styles.hudValue}>🔥 {streak}</Text>
            </View>
          </View>

          <View style={styles.chipRow}>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>{categoryLabel}</Text>
            </View>

            <View style={styles.questionChip}>
              <Text style={styles.questionChipText}>
                QUESTION {idx + 1} / {totalQuestions}
              </Text>
            </View>

            {vipTier > 0 && (
              <View style={styles.vipChip}>
                <Text style={styles.vipChipText}>VIP {vipTier}</Text>
              </View>
            )}
          </View>

          <View style={styles.playSurface}>
            <View pointerEvents="none" style={styles.surfaceSheen} />
            <View pointerEvents="none" style={styles.surfaceGoldGlow} />

            <Animated.View style={[styles.questionCard, { opacity: fadeAnim }]}>
              <View pointerEvents="none" style={styles.cardGlow} />
              <Text style={styles.question}>{current.text}</Text>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: progressPercent as any }]} />
              </View>
            </Animated.View>

            <Animated.View style={[styles.answers, { opacity: fadeAnim }]}>
              {current.answers.map((a: string, i: number) => (
                <TouchableOpacity
                  key={`${a}-${i}`}
                  testID={`game-answer-${i}`}
                  onPress={() => onAnswer(a)}
                  activeOpacity={0.86}
                  disabled={locked}
                  style={[
                    styles.answerBtn,
                    locked && styles.answerLocked,
                    boosts.xp > 0 && styles.answerBoosted,
                    selectedAnswer === a && styles.answerPressed,
                    selectedAnswer === a &&
                      answerFeedback?.tone === "correct" &&
                      styles.answerCorrect,
                    selectedAnswer === a &&
                      answerFeedback?.tone === "wrong" &&
                      styles.answerWrong,
                  ]}
                >
                  <View style={styles.answerLetter}>
                    <Text style={styles.answerLetterText}>
                      {String.fromCharCode(65 + i)}
                    </Text>
                  </View>

                  <Text style={styles.answerText} numberOfLines={2}>
                    {a}
                  </Text>

                  <Text style={styles.answerArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>

            {answerFeedback && (
              <View
                style={[
                  styles.answerFeedback,
                  answerFeedback.tone === "correct" && styles.answerFeedbackCorrect,
                  answerFeedback.tone === "wrong" && styles.answerFeedbackWrong,
                  answerFeedback.tone === "sudden" && styles.answerFeedbackSudden,
                ]}
              >
                <Text style={styles.answerFeedbackText}>{answerFeedback.text}</Text>
              </View>
            )}
          </View>
          <View pointerEvents="none" style={styles.bottomContainer}>
            <View style={styles.bottomGlowLeft} />
            <View style={styles.bottomGlowRight} />
            <Text style={styles.bottomHint}>
              {isTimedMode ? "TIME PRESSURE ACTIVE" : "BUILD MOMENTUM"}
            </Text>
          </View>
        </View>
      )}
    </ImageBackground>
  );
}

// ---------------------------------------------------------
// STYLES
// ---------------------------------------------------------
const styles = StyleSheet.create({
 bottomContainer:{
  alignItems:'center',
  marginTop: 18,
},

topGlow: {
  position: "absolute",
  top: -60,
  left: -40,
  right: -40,
  height: 200,
  backgroundColor: "rgba(86,166,255,0.18)",
  borderRadius: 200,
},
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
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  content: {
  flex: 1,
  paddingHorizontal: 16,
  paddingTop: 12,
  paddingBottom: 16,
},

  header: {
    height: 54,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  hudPill: {
    minWidth: 76,
    borderRadius: 18,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: "rgba(10,22,43,0.90)",
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.24)",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  hudLabel: {
    color: "#9FD9FF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.85,
  },

  hudValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 1,
  },

  timerOrb: {
    width: 48,
    height: 48,
    borderRadius: 18,
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
    fontSize: 11,
    fontWeight: "900",
  },

  timerTextDanger: {
    color: "#FFB4B4",
  },

  modeOrb: {
    minWidth: 56,
    height: 30,
    borderRadius: 18,
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
    marginTop: 12,
    marginBottom: 16,
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

  playSurface: {
    borderRadius: 26,
    padding: 12,
    marginTop: 4,
    backgroundColor: "rgba(7,17,31,0.72)",
    borderWidth: 1,
    borderColor: "rgba(190,231,255,0.18)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.26,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
    elevation: 7,
  },

  surfaceSheen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(159,231,255,0.035)",
  },

  surfaceGoldGlow: {
    position: "absolute",
    top: -46,
    left: -30,
    width: 150,
    height: 120,
    borderRadius: 90,
    backgroundColor: "rgba(255,214,110,0.08)",
  },

  questionCard: {
    borderRadius: 22,
    paddingHorizontal: 17,
    paddingTop: 18,
    paddingBottom: 15,
    minHeight: 132,
    justifyContent: "center",
    backgroundColor: "rgba(7,17,31,0.92)",
    borderWidth: 1.2,
    borderColor: "rgba(255,214,110,0.34)",
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#1E8CFF",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
    elevation: 8,
  },

  cardGlow: {
    position: "absolute",
    top: -64,
    right: -42,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(159,231,255,0.13)",
  },

  question: {
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "900",
    marginBottom: 15,
    letterSpacing: -0.2,
    textShadowColor: "rgba(0,0,0,0.88)",
    textShadowRadius: 8,
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
    minHeight: 62,
    borderRadius: 20,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(10,25,46,0.94)",
    borderWidth: 1.2,
    borderColor: "rgba(190,231,255,0.24)",
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
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
    marginRight: 12,
    backgroundColor: "rgba(159,231,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(159,231,255,0.34)",
  },

  answerLetterText: {
    color: "#9FE7FF",
    fontSize: 14,
    fontWeight: "900",
  },

  answerText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },

  answerArrow: {
    color: "#91A4D7",
    fontSize: 18,
    fontWeight: "800",
    marginLeft: 8,
  },

  answerFeedback: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 11,
    borderRadius: 15,
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
    flex: 0,
    minHeight: 28,
    marginTop: 6,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 0,
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
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.3,
  },

  loading: {
    color: "white",
    fontSize: 11,
    fontWeight: "800",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});







