# Phase Q2 — Question Registry Upgrade

Implemented a central question registry over the Phase Q1 folder/pack schema.

## Added

- Category metadata registry.
- Recursive category/pack grouping.
- Pack merge caching at module load.
- Category-level stats.
- Difficulty breakdowns.
- Premium/free counts.
- Empty-pack warnings.
- Duplicate ID/text issue reporting.
- Random category/difficulty helper APIs.
- Mixed category pool helper API.

## Files

- `src/questions/questionRegistry.ts`
- `src/questions/questionCategories.ts`
- `src/questions/types.ts`
- `src/__tests__/questionRegistry.test.ts`

## Important

This phase does not yet implement repeat prevention, weighted selection, or adaptive sessions.
Those belong to Phase Q3/Q4/Q5.
