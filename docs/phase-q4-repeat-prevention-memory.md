# Phase Q4 — Repeat Prevention Memory

Implemented a persistent recent-question memory layer.

## What changed

- Added `src/questions/questionMemory.ts`
- Added `recentQuestionIds` to the player store
- Added `recordRecentQuestions()` and `clearRecentQuestions()`
- Quick Play curated sessions now exclude recently seen questions
- Tournament quick sessions also exclude recently seen questions
- Ranked/Survival questions are recorded when launched through QuickGame
- Recent question memory is capped at 300 IDs

## Why this matters

TriviaWorld now avoids showing players the same recently seen questions repeatedly. This makes sessions feel fresher and prepares the app for Q5 weighted selection.

## Safe behavior

If a category does not have enough fresh questions, the engine falls back to the full pool instead of returning an empty game.
