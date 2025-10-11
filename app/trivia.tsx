// app/trivia.tsx
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { common } from "../src/lib/theme";
import ScoreBoard from "../src/components/ScoreBoard";
import Timer from "../src/components/Timer";
import QuestionCard from "../src/components/QuestionCard";
import { TriviaSession } from "../src/engine/session";
import questionsData from "../src/data/sampleQuestions.json";
import { useRouter } from "expo-router";
import { BannerAd } from "../src/lib/adsManager"; // ✅ Only banner imported
// 🩹 Removed showInterstitial import to prevent undefined function warning
import { playSound } from "../src/lib/soundManager";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ for Ad-Free fallback
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../src/lib/firebase";
const uiClickSfx = require("../assets/sfx/ui_click.mp3");

export default function TriviaScreen() {
  const router = useRouter();

  const [session] = useState(new TriviaSession(questionsData));
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [question, setQuestion] = useState(session.current);
  const [showNext, setShowNext] = useState(false);
  const [timeKey, setTimeKey] = useState(0);
  const [adShown, setAdShown] = useState(false);
  const [isAdFree, setIsAdFree] = useState(false); // ✅ new

  const db = getFirestore(app);
  const auth = getAuth(app);

  // ✅ Load adFree flag
  useEffect(() => {
    const loadAdFree = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (uid) {
          const ref = doc(db, "users", uid);
          const snap = await getDoc(ref);
          if (snap.exists() && snap.data().adFree) {
            setIsAdFree(true);
          }
        } else {
          const local = await AsyncStorage.getItem("adFree");
          if (local === "true") setIsAdFree(true);
        }
      } catch (err) {
        console.warn("adFree load error:", err);
      }
    };
    loadAdFree();
  }, []);

  // 🎯 Handle answer selection
  const handleAnswer = (index: number) => {
    const result = session.answer(index, 5);
    setScore(session.summary.score);
    setStreak(session.summary.streak);
    setShowNext(true);

    if (session.isComplete) {
      const handleCompletion = async () => {
        try {
          // 🩹 Temporarily skip interstitial to avoid undefined call
          // Later, this can call await showInterstitial() once implemented again.
          console.log("Skipping interstitial (stub for future update).");
        } catch (err) {
          console.warn("Interstitial failed or skipped:", err);
        } finally {
          playSound(uiClickSfx);
          router.push("/results");
        }
      };
      handleCompletion();
    }
  };

  const handleTimerEnd = () => {
    handleAnswer(-1);
  };

  useEffect(() => {
    if (showNext && !session.isComplete) {
      const timeout = setTimeout(() => {
        setQuestion(session.current);
        setShowNext(false);
        setTimeKey(timeKey + 1);
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [showNext]);

  return (
    <View style={[common.screen, { alignItems: "center", justifyContent: "space-between" }]}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ScoreBoard score={score} streak={streak} />
        <Timer key={timeKey} duration={5} onEnd={handleTimerEnd} />

        {!session.isComplete && question && (
          <QuestionCard
            question={question.text}
            options={question.options}
            onSelect={handleAnswer}
          />
        )}

        {session.isComplete && (
          <Text style={[common.text, { marginTop: 40 }]}>
            🎉 All done! Redirecting...
          </Text>
        )}
      </View>

      {/* ✅ Banner shows only if not ad-free */}
      {!isAdFree && (
        <View style={{ width: "100%", alignItems: "center", marginBottom: 4 }}>
          <BannerAd />
        </View>
      )}
    </View>
  );
}