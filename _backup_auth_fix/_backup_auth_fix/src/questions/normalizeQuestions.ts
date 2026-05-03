// src/questions/normalizeQuestions.ts

export type RawQuestion = {
  id: number | string;
  category: string;
  premium?: boolean;
  difficulty: "easy" | "medium" | "hard";
  text: string;
  answers: string[];
  correct: string;
};

export type NormalizedQuestion = {
  id: number | string;
  category: string;
  premium?: boolean;
  difficulty: "easy" | "medium" | "hard";
  text: string;
  answers: string[];
  correctAnswerIndex: number;
};

export function normalizeQuestions(
  raw: RawQuestion[]
): NormalizedQuestion[] {
  return raw.map((q) => {
    if (!q.answers || q.answers.length < 2) {
      throw new Error(`Invalid answers for question ${q.id}`);
    }

    const index = q.answers.indexOf(q.correct);

    if (index === -1) {
      throw new Error(
        `Correct answer not found in answers for question ${q.id}`
      );
    }

    return {
      id: q.id,
      category: q.category.toLowerCase(),
      premium: q.premium ?? false,
      difficulty: q.difficulty,
      text: q.text,
      answers: q.answers,
      correctAnswerIndex: index,
    };
  });
}
