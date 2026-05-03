export type Question = {
  id: string;
  text: string;
  options: string[];
  answerIndex: number;
};

// Simple local questions so the app is testable without backend:
export const sampleQuestions: Question[] = [
  { id: 'q1', text: 'What is the capital of France?', options: ['Berlin','Madrid','Paris','Lisbon'], answerIndex: 2 },
  { id: 'q2', text: 'React Native is built on top of?', options: ['Vue','React','Angular','Svelte'], answerIndex: 1 },
  { id: 'q3', text: '2 + 2 = ?', options: ['3','4','5','22'], answerIndex: 1 }
];

export async function getQuickPlayQuestions(): Promise<Question[]> {
  return sampleQuestions;
}



