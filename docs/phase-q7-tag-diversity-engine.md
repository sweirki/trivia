# Phase Q7 — Tag Diversity Engine

Implemented a dedicated tag diversity layer for the question engine.

## Added

- `src/questions/questionTags.ts`
- `src/__tests__/questionTags.test.ts`

## Updated

- `src/questions/questionWeights.ts`
- `src/questions/questionSession.ts`

## What it does

- Normalizes tags consistently.
- Tracks tag usage during a session.
- Penalizes repeated tags/topics/franchises.
- Rewards fresh tags inside the same session.
- Exposes a `tagSummary` on built sessions for diagnostics.

## Why it matters

This prevents sessions from feeling repetitive, for example:

- Marvel → Marvel → Marvel
- Nissan → Nissan → Nissan
- Football clubs → football clubs → football clubs

The engine can still use repeated tags when pools are small, but it now strongly prefers variety when options exist.
