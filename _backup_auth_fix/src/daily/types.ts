export type DailyState = {
  lastClaimDate: string | null; // YYYY-MM-DD (UTC)
  streak: number;               // consecutive days
  totalClaims: number;          // lifetime
};
