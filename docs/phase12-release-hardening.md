# Phase 12 — Release Hardening

This phase intentionally avoids new gameplay architecture. The goal is to protect the now-stable Q1–Q10 platform while preparing internal release builds.

## Added

- Pure release-readiness validator:
  - `src/config/releaseReadiness.ts`
  - `src/__tests__/releaseReadiness.test.ts`
- CI/local release hardening script:
  - `scripts/release-hardening-check.js`
  - `npm run release:check`
- Extra Maestro gameplay integrity flow:
  - `.maestro/quick-category-sudden-death.yaml`
  - `npm run e2e:maestro:quick-sudden`

## Release gate

Before producing an internal/TestFlight-style build, run:

```bash
npm run typecheck
npm run lint
npm test
npm run release:check
npm run e2e:maestro
```

## Guardrails

- Native Sentry plugin remains intentionally paused.
- Monetization remains paused unless production RevenueCat keys and purchase flows are deliberately finalized.
- No persistence/store rewrites were included in this phase.
- No question-engine rewrites were included in this phase.

## Manual smoke focus

- Quick → category change → Memes → Sudden Death
- Daily restart consistency
- Arena ranked/survival launch
- Offline startup behavior
- Auth/profile hydration after restart
