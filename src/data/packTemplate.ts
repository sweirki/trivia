// src/data/packTemplate.ts
export const PACK_SCHEMA_EXAMPLE = {
  id: "unique-pack-id",
  name: "Pack Name",
  category: "Category Name",
  language: "en",
  source: "AI",
  difficulty: "medium",
  questions: [
    {
      question: "Example question text?",
      options: ["A", "B", "C", "D"],
      answer: 1 // index of correct option
    }
  ]
};
