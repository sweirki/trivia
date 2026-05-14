# Audio/Haptics Wrong Answer Hotfix

This hotfix targets the report that selecting a wrong answer felt like it did nothing.

## Changes

- Strengthened `feedback.wrong()` so incorrect answers trigger:
  - immediate native vibration fallback
  - error haptic feedback
  - wrong-answer sound
  - short secondary error sound fallback

- Updated the main quick game screen so a wrong selected answer now has visible feedback:
  - selected wrong answer turns red
  - selected wrong answer shakes briefly
  - selected correct answer turns success green

## Files changed

- `src/feedback/feedback.ts`
- `app/(app)/play/game.tsx`

## Notes

The existing `assets/sounds/wrong.mp3` and `assets/sounds/error.mp3` are reused. No new MP3 files are required for this fix.
