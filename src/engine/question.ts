export type Question = {
  id: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
