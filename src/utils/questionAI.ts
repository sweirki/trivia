export async function generateAIQuestion(category = 'general', difficulty = 'medium', language = 'en') {
  try {
    const response = await fetch('https://your-api.com/generate-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, difficulty, language }),
    });

    if (!response.ok) throw new Error('API failed');

    const data = await response.json();
    return {
      question: data.question,
      options: data.options,
      answer: data.answer,
      source: 'AI (live)',
      category,
      difficulty,
      language,
    };
  } catch (err) {
    console.warn('Falling back to local mock');
    return {
      question: 'What is the capital of France?',
      options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
      answer: 2,
      source: 'AI (mock)',
      category,
      difficulty,
      language,
    };
  }
}