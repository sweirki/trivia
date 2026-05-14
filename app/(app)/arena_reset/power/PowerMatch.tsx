import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

import { usePowerUpStore } from "@/arena/store/usePowerUpStore";
import { usePowerArenaMatchStore } from "@/arena/power/store/usePowerArenaMatchStore";
import { feedback } from "@/feedback";

const INTRO_COUNTDOWN_START = 3;

const POWER_META: Record<string, { label: string; icon: string; hint: string }> = {
  freeze: { label: "Freeze", icon: "❄️", hint: "Pause timer" },
  shield: { label: "Shield", icon: "🛡️", hint: "Block mistake" },
  double: { label: "2×", icon: "✖️", hint: "Double score" },
  reroll: { label: "Reroll", icon: "🔁", hint: "New question" },
  reveal: { label: "Reveal", icon: "🎯", hint: "Remove wrong" },
};

type PowerQuestion = {
  id?: string | number;
  question?: string;
  options?: string[];
  correctAnswer?: string | number;
};

function normalize(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function isCorrectPick(picked: string, question: PowerQuestion) {
  const pickedValue = normalize(picked);
  const correctAnswer = question.correctAnswer;

  if (pickedValue && pickedValue === normalize(correctAnswer)) return true;

  const letters = ["a", "b", "c", "d"];
  const letterIndex = letters.indexOf(normalize(correctAnswer));

  if (
    letterIndex >= 0 &&
    Array.isArray(question.options) &&
    question.options[letterIndex]
  ) {
    return pickedValue === normalize(question.options[letterIndex]);
  }

  const numericAnswer = Number(correctAnswer);

  if (Number.isFinite(numericAnswer) && Array.isArray(question.options)) {
    const zeroBased = Math.trunc(numericAnswer);
    const oneBased = zeroBased - 1;

    if (
      question.options[zeroBased] &&
      pickedValue === normalize(question.options[zeroBased])
    ) {
      return true;
    }

    if (
      question.options[oneBased] &&
      pickedValue === normalize(question.options[oneBased])
    ) {
      return true;
    }
  }

  return false;
}

export default function PowerMatch() {
  const {
    questions,
    currentIndex,
    timeLeft,
    tick,
    answerQuestion,
    matchEnded,
    activateFreeze,
    activateShield,
    activateDoubleScore,
    rerollQuestion,
    revealTwoWrong,
    eliminatedIndexes,
    freezeActive,
    shieldActive,
    doubleScoreActive,
    score,
  } = usePowerArenaMatchStore();

  const { usePowerUp, hasPowerUp } = usePowerUpStore();

  const [introVisible, setIntroVisible] = useState(true);
  const [introCountdown, setIntroCountdown] = useState(INTRO_COUNTDOWN_START);
  const [lastPowerUsed, setLastPowerUsed] = useState<string | null>(null);
  const [momentText, setMomentText] = useState<string | null>(null);
  const [correctStreak, setCorrectStreak] = useState(0);

  const navigatedRef = useRef(false);
  const answeredRef = useRef(false);
  const powerUsedRef = useRef(false);
  const lastUsedPowerRef = useRef<string | null>(null);

  const question = questions[currentIndex] as PowerQuestion | undefined;
  const blocked = !question;

  const questionNumber = currentIndex + 1;
  const totalQuestions = Math.max(questions.length, 1);
  const progressLabel = `${questionNumber}/${totalQuestions}`;

  const options = Array.isArray(question?.options) ? question.options : [];

  const pressureText = useMemo(() => {
    if (freezeActive) return "Timer frozen. Use this window carefully.";
    if (doubleScoreActive) return "Double score armed. This answer matters.";
    if (shieldActive) return "Shield active. You have protection.";
    if (timeLeft <= 3) return "Critical timer pressure. Decide now.";
    return "Choose the right tool. One power-up per question.";
  }, [doubleScoreActive, freezeActive, shieldActive, timeLeft]);

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
    answeredRef.current = false;
    powerUsedRef.current = false;
    lastUsedPowerRef.current = null;
    setLastPowerUsed(null);
    setMomentText(null);
  }, [currentIndex]);

  useEffect(() => {
    if (!momentText) return;

    const timeout = setTimeout(() => {
      setMomentText(null);
    }, 1200);

    return () => clearTimeout(timeout);
  }, [momentText]);

  useEffect(() => {
    if (introVisible || matchEnded || blocked) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [blocked, introVisible, matchEnded, tick]);

  useEffect(() => {
    if (!matchEnded || navigatedRef.current) return;

    navigatedRef.current = true;
    router.replace("/(app)/arena_reset/power/PowerResult");
  }, [matchEnded]);

  const handleAnswer = (answer: string) => {
    if (answeredRef.current || blocked || !question) return;

    answeredRef.current = true;

    const correct = isCorrectPick(answer, question);

    if (correct) {
      const nextStreak = correctStreak + 1;
      setCorrectStreak(nextStreak);

      if (doubleScoreActive || lastUsedPowerRef.current === "double") {
        feedback.arenaClutch();
        setMomentText("✖️ DOUBLE SCORE HIT");
      } else if (timeLeft <= 2) {
        feedback.arenaClutch();
        setMomentText("⚡ CLUTCH ANSWER");
      } else if (nextStreak > 0 && nextStreak % 3 === 0) {
        feedback.streak();
        setMomentText("🔥 TACTICAL STREAK");
      } else {
        feedback.correct();
      }
    } else {
      setCorrectStreak(0);

      if (shieldActive || lastUsedPowerRef.current === "shield") {
        feedback.arenaClutch();
        setMomentText("🛡️ SHIELD SAVE");
      } else {
        feedback.wrong();
        setMomentText("💥 PRESSURE MISS");
      }
    }

    answerQuestion(correct);
  };

  const activate = (type: string, action: () => void) => {
    if (powerUsedRef.current) return;

    const ok = usePowerUp(type);
    if (!ok) return;

    action();
    powerUsedRef.current = true;
    lastUsedPowerRef.current = type;
    setLastPowerUsed(type);

    feedback.arenaClutch();

    if (type === "freeze") setMomentText("❄️ TIME FROZEN");
    if (type === "shield") setMomentText("🛡️ SHIELD ARMED");
    if (type === "double") setMomentText("✖️ DOUBLE SCORE ARMED");
    if (type === "reroll") setMomentText("🔁 QUESTION REROLLED");
    if (type === "reveal") setMomentText("🎯 WRONG ANSWERS REMOVED");
  };

  if (introVisible) {
    return (
      <View style={styles.container}>
        <View style={styles.introCard}>
          <Text style={styles.introLabel}>POWER-UP ARENA</Text>
          <Text style={styles.introTitle}>Tactical Battle</Text>
          <Text style={styles.introBody}>
            One power-up per question. Save tools for clutch moments and overpower
            the run.
          </Text>

          <View style={styles.introGrid}>
            <Text style={styles.introPill}>❄️ Freeze</Text>
            <Text style={styles.introPill}>🛡️ Shield</Text>
            <Text style={styles.introPill}>🎯 Reveal</Text>
          </View>

          <Text style={styles.countdownBig}>
            {introCountdown > 0 ? introCountdown : "GO!"}
          </Text>
        </View>
      </View>
    );
  }

  if (blocked) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>Preparing tactical match…</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.headerLabel}>TACTICAL ROUND</Text>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Power-Up Arena</Text>
          <Text style={styles.progressPill}>{progressLabel}</Text>
        </View>
        <Text style={styles.headerSub}>{pressureText}</Text>
      </View>

      <View style={styles.statusRow}>
        <View style={styles.statusBox}>
          <Text style={styles.statusValue}>{score}</Text>
          <Text style={styles.statusLabel}>Score</Text>
        </View>

        <View style={styles.statusBox}>
          <Text style={[styles.statusValue, timeLeft <= 3 && styles.dangerText]}>
            {freezeActive ? "⏸" : `${timeLeft}s`}
          </Text>
          <Text style={styles.statusLabel}>Timer</Text>
        </View>

        <View style={styles.statusBox}>
          <Text style={styles.statusValue}>
            {powerUsedRef.current ? "1/1" : "0/1"}
          </Text>
          <Text style={styles.statusLabel}>Power</Text>
        </View>
      </View>

      {momentText ? (
        <View style={styles.momentCard}>
          <Text style={styles.momentText}>{momentText}</Text>
        </View>
      ) : lastPowerUsed ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>
            {POWER_META[lastPowerUsed]?.icon} {POWER_META[lastPowerUsed]?.label} activated
          </Text>
        </View>
      ) : null}

      <View style={styles.questionWrap}>
        <Text style={styles.question}>{question?.question ?? "Question"}</Text>
      </View>

      {options.map((answer, index) => {
        const eliminated = eliminatedIndexes.includes(index);

        return (
          <TouchableOpacity
            key={`${answer}-${index}`}
            disabled={eliminated}
            style={[styles.answerBtn, eliminated && styles.answerEliminated]}
            onPress={() => handleAnswer(answer)}
            activeOpacity={0.86}
          >
            <Text style={[styles.answerText, eliminated && styles.eliminatedText]}>
              {eliminated ? "Eliminated" : answer}
            </Text>
          </TouchableOpacity>
        );
      })}

      <View style={styles.powerBar}>
        <PowerButton
          type="freeze"
          disabled={!hasPowerUp("freeze") || powerUsedRef.current}
          active={freezeActive}
          onPress={() => activate("freeze", activateFreeze)}
        />

        <PowerButton
          type="shield"
          disabled={!hasPowerUp("shield") || powerUsedRef.current}
          active={shieldActive}
          onPress={() => activate("shield", activateShield)}
        />

        <PowerButton
          type="double"
          disabled={!hasPowerUp("double") || powerUsedRef.current}
          active={doubleScoreActive}
          onPress={() => activate("double", activateDoubleScore)}
        />

        <PowerButton
          type="reroll"
          disabled={!hasPowerUp("reroll") || powerUsedRef.current}
          onPress={() => activate("reroll", rerollQuestion)}
        />

        <PowerButton
          type="reveal"
          disabled={!hasPowerUp("reveal") || powerUsedRef.current}
          onPress={() => activate("reveal", revealTwoWrong)}
        />
      </View>
    </ScrollView>
  );
}

function PowerButton({
  type,
  onPress,
  disabled,
  active,
}: {
  type: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  const meta = POWER_META[type];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.pUpBtn,
        disabled && styles.pUpDisabled,
        active && styles.pUpActive,
      ]}
      activeOpacity={0.86}
    >
      <Text style={styles.pUpIcon}>{meta.icon}</Text>
      <Text style={styles.pUpText}>{meta.label}</Text>
      <Text style={styles.pUpHint}>{meta.hint}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070713",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 42,
    paddingBottom: 118,
  },
  introCard: {
    marginHorizontal: 16,
    marginTop: 112,
    backgroundColor: "#111827",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4FC3F7",
    padding: 18,
    alignItems: "center",
  },
  introLabel: {
    color: "#4FC3F7",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  introTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  introBody: {
    color: "#cfc7d9",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 8,
  },
  introGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: 14,
  },
  introPill: {
    color: "#DDF6FF",
    fontSize: 10,
    fontWeight: "900",
    backgroundColor: "rgba(79,195,247,0.14)",
    borderColor: "rgba(79,195,247,0.35)",
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  countdownBig: {
    color: "#4FC3F7",
    fontSize: 44,
    fontWeight: "900",
    marginTop: 18,
  },
  loadingCard: {
    marginHorizontal: 16,
    marginTop: 112,
    backgroundColor: "#151521",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#27273B",
  },
  loadingText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "800",
  },
  headerCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#26344f",
    padding: 12,
    marginBottom: 8,
  },
  headerLabel: {
    color: "#4FC3F7",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 5,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },
  header: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    flex: 1,
  },
  progressPill: {
    color: "#061018",
    backgroundColor: "#4FC3F7",
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  headerSub: {
    color: "#aaa8bc",
    fontSize: 11,
    lineHeight: 15,
    marginTop: 4,
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  statusBox: {
    flex: 1,
    backgroundColor: "#151521",
    borderRadius: 13,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2b2b3f",
  },
  statusValue: {
    color: "#4FC3F7",
    fontSize: 18,
    fontWeight: "900",
  },
  statusLabel: {
    color: "#8d95aa",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
  },
  dangerText: {
    color: "#FF5C7A",
  },
  momentCard: {
    backgroundColor: "#241A05",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F7C948",
    paddingVertical: 9,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  momentText: {
    color: "#F7C948",
    textAlign: "center",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  feedbackCard: {
    backgroundColor: "#102A3D",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(79,195,247,0.35)",
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  feedbackText: {
    color: "#DDF6FF",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "900",
  },
  questionWrap: {
    backgroundColor: "#151521",
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: "#27273B",
    marginBottom: 8,
  },
  question: {
    color: "#FFFFFF",
    fontSize: 17,
    lineHeight: 22,
    textAlign: "center",
    fontWeight: "800",
  },
  answerBtn: {
    backgroundColor: "#1c1c29",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: "#2b2b3f",
  },
  answerEliminated: {
    opacity: 0.28,
  },
  answerText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
  },
  eliminatedText: {
    color: "#8b8b9d",
  },
  powerBar: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    gap: 6,
    marginTop: 10,
    marginBottom: 6,
  },
  pUpBtn: {
    flex: 1,
    backgroundColor: "rgba(79,195,247,0.16)",
    borderWidth: 1,
    borderColor: "rgba(79,195,247,0.45)",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 11,
    alignItems: "center",
    minHeight: 72,
  },
  pUpDisabled: {
    opacity: 0.35,
  },
  pUpActive: {
    backgroundColor: "rgba(247,201,72,0.18)",
    borderColor: "#FFD54F",
  },
  pUpIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  pUpText: {
    color: "#DDF6FF",
    fontWeight: "900",
    fontSize: 10,
  },
  pUpHint: {
    color: "#90A4B8",
    fontWeight: "700",
    fontSize: 8,
    marginTop: 2,
    textAlign: "center",
    lineHeight: 10,
  },
});
