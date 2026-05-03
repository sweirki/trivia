export function calculateAccuracy(
  correctCount: number,
  totalQuestions: number
): number {
  if (totalQuestions === 0) return 0;
  return correctCount / totalQuestions;
}
