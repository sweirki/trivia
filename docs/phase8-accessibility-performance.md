# Phase 8 — Accessibility + Performance Pass

## Implemented

- Shared button components now expose accessibility labels, hints, disabled/busy state, and safe font scaling.
- Shared cards support accessible press targets and selected/disabled state.
- Section headers are announced as headers.
- ScreenShell scroll views use keyboard-safe taps and clipped subview removal.
- Store tabs, product cards, cosmetic cards, message banner, and action buttons have accessible roles/states.
- More lobby cards announce title + subtitle instead of decorative-only labels.
- Leaderboard tabs and challenge buttons expose roles/states.
- Leaderboard list rendering was tuned with `initialNumToRender`, `maxToRenderPerBatch`, `windowSize`, and `removeClippedSubviews`.
- Friends add-code input now has a label/hint.
- Text in updated shared/polished surfaces allows controlled font scaling.

## Guardrails

No changes were made to:

- persistence
- Firebase sync architecture
- reward logic
- monetization purchase logic
- RevenueCat product configuration
- Maestro flows
- Sentry/native plugin setup

## Verification to run locally

```bash
npm run typecheck
npm run lint
npm test
npm run e2e:maestro
```

Maestro depends on local CLI availability.
