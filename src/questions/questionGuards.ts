// src/questions/questionGuards.ts
// Phase 11: runtime safety guards for gameplay question sessions.

import type { NormalizedQuestion } from "./types";

export type QuestionGuardIssue =
  | "missing-text"
  | "invalid-answers"
  | "duplicate-answers"
  | "invalid-correct-answer-index"
  | "missing-correct-answer";

function normalizeAnswerForComparison(answer: unknown) {
  return String(answer ?? "").trim().toLowerCase();
}

export function getQuestionGuardIssues(
  question: Pick<
    NormalizedQuestion,
    "text" | "answers" | "correctAnswer" | "correctAnswerIndex"
  >
): QuestionGuardIssue[] {
  const issues: QuestionGuardIssue[] = [];

  if (!String(question.text ?? "").trim()) {
    issues.push("missing-text");
  }

  if (!Array.isArray(question.answers) || question.answers.length !== 4) {
    issues.push("invalid-answers");
  } else {
    const normalizedAnswers = question.answers.map(normalizeAnswerForComparison);

    if (normalizedAnswers.some((answer) => !answer)) {
      issues.push("invalid-answers");
    }

    if (new Set(normalizedAnswers).size !== normalizedAnswers.length) {
      issues.push("duplicate-answers");
    }
  }

  const correctAnswerIndex = Number(question.correctAnswerIndex);

  if (
    !Number.isInteger(correctAnswerIndex) ||
    correctAnswerIndex < 0 ||
    correctAnswerIndex >= question.answers.length
  ) {
    issues.push("invalid-correct-answer-index");
  }

  const answerAtIndex = question.answers[correctAnswerIndex];

  if (
    !String(question.correctAnswer ?? "").trim() ||
    normalizeAnswerForComparison(answerAtIndex) !==
      normalizeAnswerForComparison(question.correctAnswer)
  ) {
    issues.push("missing-correct-answer");
  }

  return issues;
}

export function isPlayableQuestion(question: NormalizedQuestion) {
  return getQuestionGuardIssues(question).length === 0;
}

export function filterPlayableQuestions(questions: NormalizedQuestion[]) {
  return questions.filter(isPlayableQuestion);
}

export function assertPlayableQuestion(question: NormalizedQuestion) {
  const issues = getQuestionGuardIssues(question);

  if (issues.length) {
    throw new Error(
      `Question ${question.id} is not playable: ${issues.join(", ")}`
    );
  }
}


