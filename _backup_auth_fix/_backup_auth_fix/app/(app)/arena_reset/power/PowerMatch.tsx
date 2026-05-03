import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { usePowerUpStore } from "@/arena/store/usePowerUpStore";
import { usePowerArenaMatchStore } from "@/arena/power/store/usePowerArenaMatchStore";


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
} = usePowerArenaMatchStore();

const navigatedRef = useRef(false);
const answeredRef = useRef(false);
const powerUsedRef = useRef(false);


const q = questions[currentIndex];
const blocked = !q;



  // START MATCH (questions already prepared upstream)
 useEffect(() => {
  answeredRef.current = false;
  powerUsedRef.current = false;
}, [currentIndex]);



  // TIMER
 useEffect(() => {
  if (matchEnded && !navigatedRef.current) {
    navigatedRef.current = true;
    router.replace("/(app)/arena_reset/power/PowerResult");
  }
}, [matchEnded]);


const isCorrectPick = (picked: string, q: any) => {
  const norm = (v: any) => String(v ?? "").trim().toLowerCase();

  const pickedN = norm(picked);
  const ca = q?.correctAnswer;

  // 1) direct text match
  if (pickedN && pickedN === norm(ca)) return true;

  // 2) letter format: "A" "B" "C" "D"
  const letters = ["a", "b", "c", "d"];
  const li = letters.indexOf(norm(ca));
  if (li >= 0 && Array.isArray(q?.options) && q.options[li]) {
    return pickedN === norm(q.options[li]);
  }

  // 3) index format: "0".."3" or "1".."4"
  const n = Number(ca);
  if (Number.isFinite(n) && Array.isArray(q?.options)) {
    const i0 = Math.trunc(n);
    const i1 = i0 - 1;
    if (q.options[i0] && pickedN === norm(q.options[i0])) return true;
    if (q.options[i1] && pickedN === norm(q.options[i1])) return true;
  }

  return false;
};

  const handleAnswer = (ans: string) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
  answerQuestion(isCorrectPick(ans, q));
  };
const { usePowerUp, hasPowerUp } = usePowerUpStore();


const activate = (type: string, fn: () => void) => {
  if (powerUsedRef.current) return;

  const ok = usePowerUp(type);
  if (!ok) return;

  fn();
  powerUsedRef.current = true;
};



  return (
  <View style={styles.container}>
    {blocked ? (
      <Text style={{ color: "#fff", textAlign: "center", marginTop: 40 }}>
        Loading…
      </Text>
    ) : (
      <>
        <Text style={styles.header}>Power-Up Arena</Text>

        <Text style={styles.timer}>
          {freezeActive ? "⏸ PAUSED" : `⏳ ${timeLeft}s`}
        </Text>

        <View style={styles.questionWrap}>
          <Text style={styles.question}>{q.question}</Text>
        </View>

        {q.options.map((ans: string, idx: number) => {
          const eliminated = eliminatedIndexes.includes(idx);

          return (
            <TouchableOpacity
              key={idx}
              disabled={eliminated}
              style={[
                styles.answerBtn,
                eliminated && styles.answerEliminated,
              ]}
              onPress={() => handleAnswer(ans)}
            >
              <Text style={styles.answerText}>{ans}</Text>
            </TouchableOpacity>
          );
        })}

        <View style={styles.powerBar}>
          <PowerButton
            label="Freeze"
            disabled={!hasPowerUp("freeze")}
            active={freezeActive}
            onPress={() => activate("freeze", activateFreeze)}
          />
          <PowerButton
            label="Shield"
            disabled={!hasPowerUp("shield")}
            active={shieldActive}
            onPress={() => activate("shield", activateShield)}
          />
          <PowerButton
            label="2×"
            disabled={!hasPowerUp("double")}
            active={doubleScoreActive}
            onPress={() => activate("double", activateDoubleScore)}
          />
          <PowerButton
            label="Reroll"
            disabled={!hasPowerUp("reroll")}
            onPress={() => activate("reroll", rerollQuestion)}
          />
          <PowerButton
            label="Reveal"
            disabled={!hasPowerUp("reveal")}
            onPress={() => activate("reveal", revealTwoWrong)}
          />
        </View>
      </>
    )}
  </View>
);

}
function PowerButton({
  label,
  onPress,
  disabled,
  active,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
}) {

  return (
   <TouchableOpacity
  onPress={onPress}
  disabled={disabled}
  style={[
    styles.pUpBtn,
    disabled && styles.pUpDisabled,
    active && styles.pUpActive,
  ]}
>

      <Text style={styles.pUpText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0e14",
    paddingHorizontal: 20,
    paddingTop: 70,
  },
  header: {
    color: "#4FC3F7",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  timer: {
    color: "#4FC3F7",
    textAlign: "center",
    marginVertical: 12,
    fontSize: 22,
  },
  question: {
    color: "#fff",
    fontSize: 22,
    marginVertical: 20,
  },
  answerBtn: {
    backgroundColor: "#1c1c29",
    padding: 14,
    borderRadius: 12,
    marginVertical: 6,
  },
  answerEliminated: {
  opacity: 0.25,
},

  answerText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
  },
 powerBar: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: 10,
  marginTop: 30,
},

 pUpBtn: {
  backgroundColor: "#4FC3F7",
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 10,
  margin: 4,
},

  questionWrap: {
  paddingHorizontal: 16,
  marginVertical: 12,
},

  pUpText: {
    color: "#000",
    fontWeight: "700",
  },
  pUpDisabled: {
  opacity: 0.4,
},

pUpActive: {
  borderColor: "#FFD54F",
  borderWidth: 2,
},

});
