import { buildGameplayQuestions } from "@/questions/gameplayQuestions";

export type Question = {
  id: string;
  text: string;
  options: string[];
  answerIndex: number;
};

export async function getQuickPlayQuestions(): Promise<Question[]> {
  return buildGameplayQuestions({
    mode: "classic",
    count: 10,
    allowPremium: false,
  }).map((question) => ({
    id: String(question.id),
    text: question.text,
    options: question.answers,
    answerIndex: question.correctAnswerIndex,
  }));
}
