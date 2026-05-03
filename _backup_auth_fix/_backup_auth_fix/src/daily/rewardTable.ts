export function getDailyReward(streak: number) {

  
  if (streak >= 7) {
    return { coins: 250, xp: 100 };
  }

  const table = [
    { coins: 50, xp: 20 },   // day 1
    { coins: 60, xp: 25 },   // day 2
    { coins: 75, xp: 30 },   // day 3
    { coins: 90, xp: 40 },   // day 4
    { coins: 120, xp: 50 },  // day 5
    { coins: 150, xp: 65 },  // day 6
  ];

  return table[streak - 1] ?? table[0];
}
