# Phase 2 Gameplay Feel Patch

Scope: lightweight gameplay-feel improvements only. No backend, economy, question-bank, navigation, or heavy asset changes.

## Files included

- `app/(app)/play/game.tsx`
- `app/(app)/play/(screens)/result.tsx`

## What changed

### Game screen
- Resets the question fade animation on every question index change, so question transitions actually animate instead of staying at opacity 1.
- Adds a lightweight answer-feedback entrance animation using opacity, scale, and small vertical lift.
- Adds immediate tap feedback before correct/wrong resolution.
- Keeps existing correct/wrong/sudden-death feedback logic and timing.
- Keeps timer pressure and panic overlay lightweight with opacity/scale only.

### Result screen
- Adds result-entry reward feedback using existing feedback system.
- Adds reward-grid reveal animation using opacity and scale.
- Adds tap feedback for Play Again, Back to Hub, and post-game offer CTA.
- Removes a duplicate `fontWeight` style in `meta`.
- Updates primary result CTAs to the clean cyan button language already chosen for the app:
  - background `#8EDCF7`
  - border `#C6F1FF`
  - text `#062033`

## Validation after applying

Run:

```powershell
npm run typecheck
npm run lint
npm test
npx expo start -c
```

RevenueCat emulator billing errors can still be ignored.
