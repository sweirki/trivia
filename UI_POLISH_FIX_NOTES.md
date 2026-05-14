# UI polish fixes

Applied to latest uploaded archive:

- Fixed Home Hub `Daily` and `Lobby` cards:
  - equal width/height
  - centered content
  - one-line clamped subtitles
  - overflow hidden so text stays inside cards
  - pressed visual feedback

- Improved Arena tap feedback:
  - Arena mode cards now scale/opacity on press
  - Arena TouchableOpacity controls now use stronger `activeOpacity`
  - This makes tournament/ranked/power buttons visibly react immediately when touched.

Test locally:
```bash
npx expo run:android
```
