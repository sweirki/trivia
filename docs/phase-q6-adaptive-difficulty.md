# Phase Q6 — Adaptive Difficulty

Implemented a safe adaptive difficulty layer for Quick Play.

## What changed

- Added adaptive difficulty state to the player store.
- Recorded question performance after each answered Quick Play question.
- Derived a rolling accuracy profile from recent answers.
- Recommended a preferred difficulty for casual sessions.
- Kept competitive modes stable by returning `medium` for ranked, daily, and tournament sessions.
- Wired Quick Play session building to use the adaptive preferred difficulty.

## Files

- `src/questions/adaptiveDifficulty.ts`
- `src/__tests__/adaptiveDifficulty.test.ts`
- `src/store/player/player.types.ts`
- `src/store/player/player.store.ts`
- `src/store/useQuickGameStore.ts`

## Safety

This phase does not change rewards, persistence architecture, Firebase schema strategy, monetization, or arena rules.
The new state is normalized during hydration and synced with the rest of the player profile.
