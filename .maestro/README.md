# Maestro E2E — Phase 3

This folder contains the first production-safety Maestro coverage for TriviaWorld.

## Prerequisites

Install Maestro locally:

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

Start the app on a simulator/emulator or dev client first:

```bash
npx expo start --clear
```

Then run:

```bash
npm run e2e:maestro:launch
npm run e2e:maestro:smoke
npm run e2e:maestro
```

## App ID

The default Android app id is configured as:

```txt
com.sweirki.trivia
```

Override it when needed:

```bash
APP_ID=com.your.bundle.id maestro test .maestro/smoke.yaml
```

## Current coverage

- launch and hub render
- Quick Play route opens
- Daily route opens and exposes the claim button
- Arena hub opens
- restart persistence smoke test

## Important notes

These flows intentionally avoid deep gameplay rewrites. They are smoke/regression tests designed to catch:
- launch crashes
- route regressions
- hydration stalls
- missing persistence after app restart
- broken navigation from the hub

Next E2E expansion should add deterministic fixture data for gameplay reward assertions.


## Phase 6 Expanded Coverage

Added non-monetized reliability flows:

- `profile-hydration.yaml` — validates profile hydration and return navigation.
- `store-navigation.yaml` — validates store tab navigation only; no real purchase flow is executed.
- `quick-play-start.yaml` — validates quick play mode selection and game route mount.
- `arena-expanded.yaml` — validates Arena hub mode cards.
- `long-resume.yaml` — validates multi-screen resume and restart stability.

Run all flows:

```bash
npm run e2e:maestro
```

Run selected flows:

```bash
npm run e2e:maestro:quick
npm run e2e:maestro:store
npm run e2e:maestro:profile
npm run e2e:maestro:arena
```
