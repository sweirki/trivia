# Phase Q3 — Question Session Builder Engine

Phase Q3 is implemented on top of the Phase Q1/Q2 question foundation.

## Confirmed foundation

- Phase Q1 schema normalization remains in `src/questions/normalizeQuestions.ts`
- Phase Q2 central registry remains in `src/questions/questionRegistry.ts`
- Category metadata remains in `src/questions/questionCategories.ts`
- Folder/pack question bank remains supported under `assets/data/questions/<category>/pack-###.json`

## Added in Q3

### `src/questions/questionSession.ts`

The new session builder creates curated gameplay sessions instead of simple shuffle/slice pools.

It supports:

- mode-specific question counts
- mode-specific difficulty plans
- deterministic seeded sessions for daily-style pools
- premium/free filtering
- excluded question IDs
- tag diversity scoring
- category diversity scoring
- fallback behavior when the filtered pool is too small

## Quick Play integration

`src/store/useQuickGameStore.ts` now calls the curated session builder through:

```ts
buildCuratedQuestionsForMode(...)
```

This means Quick Play no longer relies only on:

```text
load category → shuffle → slice
```

It now uses:

```text
load registry category → build curated session → start game
```

## Not included yet

These are intentionally left for future phases:

- persistent recent-question memory
- weighted freshness by player history
- global question analytics
- arena/tournament full migration
- remote question packs
