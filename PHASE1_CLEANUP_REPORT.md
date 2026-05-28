# Phase 1 Cleanup Report

## What changed

- Extracted large `StyleSheet.create(...)` blocks out of the biggest screens:
  - `app/(app)/play/(screens)/result.tsx` -> `result.styles.ts`
  - `app/(app)/play/game.tsx` -> `game.styles.ts`
  - `app/(app)/hub/index.tsx` -> `index.styles.ts`
  - `app/(app)/arena_reset/index.tsx` -> `index.styles.ts`
  - `app/(app)/profile/index.tsx` -> `index.styles.ts`

- Moved Firebase configuration out of source code:
  - Added `src/config/env.ts`
  - `src/firebase/firebase.ts` now reads `EXPO_PUBLIC_FIREBASE_*` values from environment variables.
  - Removed the hardcoded Firebase API key from the repository.

- Moved RevenueCat SDK key out of source code:
  - `src/config/revenueCatConfig.ts` now reads RevenueCat public SDK key from environment variables.
  - `src/services/revenueCatService.ts` now fails clearly if RevenueCat is configured without a key.
  - Removed the hardcoded RevenueCat key from the repository.

- Updated `env.example`:
  - Added RevenueCat environment variables.
  - Kept Firebase and Sentry placeholders.

- Improved release hardening script:
  - Fixed native-plugin check so it supports the current Expo splash plugin while keeping native Sentry paused.
  - Added Firebase environment checks.
  - Updated RevenueCat environment variable names.

- Removed some hype-style engineering comments from touched files.

## Validation performed

- Sensitive-key scan:
  - No Firebase `AIza...` API key literals found.
  - No RevenueCat `goog_...` / `appl_...` key literals found.

- Release hardening script:
  - `node scripts/release-hardening-check.js` passed.
  - It correctly warns when local environment variables are not set.

- Typecheck:
  - `npm run typecheck -- --pretty false` could not complete because `node_modules` / removed dependencies are absent in this zip.
  - The failure was dependency-resolution only:
    - missing `expo/tsconfig.base`
    - missing type definitions for `expo-router`, `jest`, and `node`

## Required before running the app

Create your local `.env` or EAS environment values using `env.example`:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...

EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY=...
EXPO_PUBLIC_REVENUECAT_APPLE_KEY=...
```

## Recommended next Phase 1 pass

After restoring dependencies / native folders locally, run:

```bash
npm install
npm run typecheck
npm run lint
npm test
node scripts/release-hardening-check.js
```
