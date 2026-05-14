# Phase Q8 — Question Analytics + Balancing

Implemented local question analytics that records answer outcomes and builds lightweight balancing signals.

## Added

- `src/questions/questionAnalytics.ts`
- `src/__tests__/questionAnalytics.test.ts`

## Updated

- `src/store/player/player.types.ts`
- `src/store/player/player.store.ts`
- `src/store/useQuickGameStore.ts`

## What this tracks

- total answered questions
- total correct / wrong
- rolling accuracy
- average answer time when available
- difficulty-level performance
- category-level performance
- per-question quality signals
- flagged question IDs for future review

## Quality signals

Questions can be marked as:

- `healthy`
- `needs_review`
- `too_easy`
- `too_hard`

This does not remove questions from gameplay yet. It only creates the safe analytics foundation for later balancing.

## Safety

- No reward logic changed
- No question schema changed
- No persistence architecture changed
- No Arena migration yet
- No remote analytics service added
- Analytics is persisted locally and included in normal player sync
