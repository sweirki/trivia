# Audio and Haptics Stabilization

## What was wrong

The feedback systems were independent and race-prone:

- Sound effects reused one cached `Audio.Sound` per effect and called `setPositionAsync(0)` while sounds could still be playing.
  On Android this can intermittently fail or leave the next replay silent.
- Multiple taps/answers could call the same sound at the same time with no per-sound queue.
- One global haptic throttle meant a button tap could suppress the next correct/wrong haptic.
- Settings screen switches were only local React state. They did not control actual sound, music, or vibration.
- Background music always mounted globally and did not pause/unload cleanly when disabled or when the app went inactive.

## Fix

- Added persistent settings store: `src/store/useSettingsStore.ts`
- Sound effects now:
  - respect the Sound Effects switch
  - serialize playback per sound key
  - stop and replay from zero safely
  - avoid Android ducking the app's own audio
- Haptics now:
  - respect the Vibration switch
  - use separate throttles for tap, impact, and notification haptics
  - never lets a tap suppress correct/wrong result feedback
- Background music now:
  - respects the Background Music switch
  - pauses/unloads when disabled
  - pauses/unloads when the app goes inactive
- Settings switches now control real app behavior and persist across launches.

## Local test

Use USB debugging for quick iteration:

```bash
npx expo run:android
```
