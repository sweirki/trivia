import { useEffect, useState } from "react";
import sampleQuestions from "@assets/data/sampleQuestions.json";
import { detectCategoryForQuestion } from "@/utils/categoryAutoDetect";

export default function useQuickGame(mode, category) {
  const [question, setQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [idx, setIdx] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const stableCategory = useState(category)[0];


  // ---------------------------
  // LOAD QUESTIONS BY CATEGORY
  // ---------------------------
 useEffect(() => {
  const enriched = sampleQuestions.map((q, i) => {
    const detected = detectCategoryForQuestion(q.text);
    const cleanCategory = typeof detected === "string" ? detected : detected?.id;

    return {
      id: i,
      question: q.text,
      answers: q.answers,
      correctAnswer: q.correct,
      category: cleanCategory,
    };
  });

  const filtered = enriched.filter((q) => q.category === stableCategory);

  // Choose final set ONCE
  const final = filtered.length >= 5 ? filtered : enriched;

  // DO NOT compare JSON strings (causes loop)
  if (questions.length === 0) {
    setQuestions(final);
  }

}, []); // <-- RUNS ONCE ONLY


  // Set first question
  useEffect(() => {
    if (questions.length > 0) {
      setQuestion(questions[idx]);
    }
  }, [questions, idx]);

  // ---------------------------
  // TIMER LOGIC (fixes 60/90 sec NaN)
  // ---------------------------
  useEffect(() => {
    let duration = 0;

    if (mode === "timed60") duration = 60;
    if (mode === "timed90") duration = 90;

    // Classic & others → no timer
    if (duration === 0) return;

    setTimeLeft(duration);

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t === 1) {
          clearInterval(interval);
          setGameOver(true);
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mode]);

  // ---------------------------
  // ANSWER HANDLER
  // ---------------------------
  function handleAnswer(choice) {
    if (!question) return;

    const isCorrect = choice === question.correctAnswer;

    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }

    const nextIndex = idx + 1;
    if (nextIndex >= questions.length) {
      setGameOver(true);
    } else {
      setIdx(nextIndex);
    }
  }

  return {
    question,
    score,
    streak,
    gameOver,
    timeLeft,
    handleAnswer,
  };
}


