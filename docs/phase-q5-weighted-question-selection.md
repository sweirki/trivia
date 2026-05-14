# Phase Q5 — Weighted Question Selection

Status: implemented.

Q1, Q2, Q3, and Q4 are present in this app build.

## What Q5 adds

Q5 upgrades question choice from simple best-score sorting into weighted curated randomness.

The engine now prefers:
- target difficulty matches
- questions with unused tags
- category diversity for mixed pools
- fresh/not-excluded questions
- premium questions only when allowed

The system still keeps randomness, but it is now controlled randomness instead of pure shuffle behavior.

## Files added

- `src/questions/questionWeights.ts`
- `src/__tests__/questionWeights.test.ts`
- `docs/phase-q5-weighted-question-selection.md`
- `docs/phase-q5-question-system-check.md`

## Files updated

- `src/questions/questionSession.ts`

## Important behavior

Quick Play already uses `buildQuestionSession()`, so Quick Play now benefits from:
- Q1 schema normalization
- Q2 registry/category packs
- Q3 curated session plans
- Q4 recent-question exclusion
- Q5 weighted selection

## Not included yet

- adaptive player-skill difficulty
- full Arena migration
- daily global curated pools
- question analytics
