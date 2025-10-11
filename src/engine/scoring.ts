export const calculateScore = (
  isCorrect: boolean,
  timeLeft: number,
  streak: number
): number => {
  if (!isCorrect) return 0;
  const base = 100;
  const timeBonus = Math.floor(timeLeft * 5);
  const streakBonus = streak * 20;
  return base + timeBonus + streakBonus;
};
