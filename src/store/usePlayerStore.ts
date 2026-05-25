// src/store/usePlayerStore.ts
// Compatibility layer: keep existing imports working while the player store lives in src/store/player/.

export { usePlayerStore } from "./player/player.store";
export type { PlayerStoreState, RewardDelta, WeeklyState } from "./player/player.types";



