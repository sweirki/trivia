// src/questions/normalizeQuestions.ts
import type { Difficulty, NormalizedQuestion, RawQuestion } from "./types";

const VALID_DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert"];

function normalizeDifficulty(value: RawQuestion["difficulty"]): Difficulty {
  const difficulty = String(value || "easy").trim().toLowerCase();

  if (VALID_DIFFICULTIES.includes(difficulty as Difficulty)) {
    return difficulty as Difficulty;
  }

  return "easy";
}

function normalizeCategory(value: RawQuestion["category"]): string {
  return String(value || "general")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
}

function normalizeAnswerText(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeAnswers(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.map(normalizeAnswerText).filter(Boolean);
}

function normalizeTags(value: unknown, fallbackCategory: string, difficulty: Difficulty): string[] {
  const rawTags = Array.isArray(value) ? value : [];

  const tags = rawTags
    .map((tag) =>
      String(tag || "")
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, "-")
    )
    .filter(Boolean);

  return Array.from(new Set([fallbackCategory, difficulty, ...tags]));
}

function getQuestionText(question: RawQuestion): string {
  return String(question.text ?? question.question ?? "").trim();
}

function getCorrectAnswer(question: RawQuestion, answers: string[]): string | null {
  if (typeof question.correctAnswerIndex === "number") {
    return answers[question.correctAnswerIndex] ?? null;
  }

  const explicitAnswer = normalizeAnswerText(
    question.correctAnswer ?? question.correct ?? question.answer
  );

  return explicitAnswer || null;
}

export function normalizeQuestions(raw: RawQuestion[]): NormalizedQuestion[] {
  if (!Array.isArray(raw)) {
    throw new Error("normalizeQuestions expected an array");
  }

  return raw.map((question, index) => {
    const text = getQuestionText(question);
    const answers = normalizeAnswers(question.answers ?? question.options);
    const category = normalizeCategory(question.category);
    const difficulty = normalizeDifficulty(question.difficulty);

    if (!text) {
      throw new Error(`Missing question text at index ${index}`);
    }

    if (answers.length !== 4) {
      throw new Error(
        `Invalid answers for question ${question.id ?? index}; expected exactly 4 answers`
      );
    }

    const uniqueAnswers = new Set(answers.map((answer) => answer.trim().toLowerCase()));

    if (uniqueAnswers.size !== answers.length) {
      throw new Error(`Duplicate answers for question ${question.id ?? index}`);
    }

    const correctAnswer = getCorrectAnswer(question, answers);

    if (!correctAnswer) {
      throw new Error(`Missing correct answer for question ${question.id ?? index}`);
    }

    const correctAnswerIndex = answers.indexOf(correctAnswer);

    if (correctAnswerIndex < 0) {
      throw new Error(
        `Correct answer not found in answers for question ${question.id ?? index}`
      );
    }

    const explanation =
      typeof question.explanation === "string" && question.explanation.trim()
        ? question.explanation.trim()
        : undefined;

    return {
      id: question.id ?? `${category}_${index}`,
      category,
      premium: question.premium === true,
      difficulty,
      text,
      answers,
      correctAnswer,
      correctAnswerIndex,
      explanation,
      tags: normalizeTags(question.tags, category, difficulty),
    };
  });
}

export type { Difficulty, NormalizedQuestion, RawQuestion };


