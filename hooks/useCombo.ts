export default function useCombo(streak: number) {
  return {
    isCombo: streak > 1,
    multiplier: streak > 1 ? streak : 1,
  };
}



