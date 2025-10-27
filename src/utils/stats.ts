export const incrementStatsForTest = (pack: {
  correctCount?: number;
  incorrectCount?: number;
  playCount?: number;
}, correct = true) => {
  if (!pack) return;
  pack.playCount = (pack.playCount || 0) + 1;
  pack.correctCount = correct ? (pack.correctCount || 0) + 1 : pack.correctCount || 0;
  pack.incorrectCount = !correct ? (pack.incorrectCount || 0) + 1 : pack.incorrectCount || 0;
};