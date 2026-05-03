// app/(app)/play/components/QuestionCard.tsx
import React, { useRef, useState, useEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
  View,
  Text,
} from "react-native";
import { useTheme } from "@/theme";
import { CATEGORIES } from "@/data/categories";

export default function QuestionCard({ question, onAnswer }) {
  const theme = useTheme();

  const [locked, setLocked] = useState(false);

  const scale = useRef(new Animated.Value(1)).current;
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setLocked(false);
    scale.setValue(1);
    shake.setValue(0);
  }, [question?.id]);

  function handle(choice) {
    if (locked) return;
    setLocked(true);

    const correct = choice === question.correct;

    if (correct) {
      Vibration.vibrate(20);

      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 130,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Vibration.vibrate(35);

      Animated.sequence([
        Animated.timing(shake, {
          toValue: 12,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: -12,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }

    setTimeout(() => onAnswer(choice), 450);
  }

  const meta = CATEGORIES.find(c => c.id === question.category);

  return (
    <View style={styles.container}>
      {/* CATEGORY HEADER */}
      {meta && (
        <View style={{ alignItems: "center", marginBottom: 14 }}>
          <Text
            style={{
              color: theme.colors.goldSoft,
              fontSize: 16,
              fontWeight: "800",
              letterSpacing: 0.5,
            }}
          >
            {meta.label.toUpperCase()}
          </Text>
        </View>
      )}

      {/* QUESTION */}
      <View style={styles.questionBox}>
        <Text
          style={[
            styles.question,
            { color: "#fff" },
          ]}
        >
          {question.text}
        </Text>
      </View>

      {/* ANSWERS */}
      {question.answers.map((ans) => {
        const isCorrect = locked && ans === question.correct;
        const isWrong = locked && ans !== question.correct;

        return (
          <Animated.View
            key={ans}
            style={{
              transform: [{ scale }, { translateX: shake }],
            }}
          >
            <TouchableOpacity
              disabled={locked}
              onPress={() => handle(ans)}
              style={[
                styles.option,
                { borderColor: theme.colors.gold },
                isCorrect && { backgroundColor: theme.colors.gold },
                isWrong && { backgroundColor: theme.colors.error },
              ]}
            >
              <Text
                style={{
                  color: isCorrect
                    ? theme.colors.background
                    : theme.colors.goldSoft,
                  fontSize: 18,
                  fontWeight: "700",
                  textAlign: "center",
                }}
              >
                {ans}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 8 },
  questionBox: {
    marginBottom: 18,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  question: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  option: {
    marginVertical: 6,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderRadius: 18,
  },
});



