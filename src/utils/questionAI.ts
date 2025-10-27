// src/utils/questionAI.ts

// This function optimizes an existing question using your backend or AI API
export const optimizeQuestion = async (question: string, topic: string) => {
  try {
    const res = await fetch('https://your-api.com/optimize-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, topic }),
    });

    if (!res.ok) {
      throw new Error('Failed to optimize question');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error optimizing question:', error);
    return null;
  }
};

// This function generates a new AI-powered question based on category, difficulty, and language
export async function generateAIQuestion(
  category = 'general',
  difficulty = 'medium',
  language = 'en'
) {
  try {
    const res = await fetch('https://your-api.com/generate-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, difficulty, language }),
    });

    if (!res.ok) {
      throw new Error('Failed to generate question');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error generating AI question:', error);
    return null;
  }
}
