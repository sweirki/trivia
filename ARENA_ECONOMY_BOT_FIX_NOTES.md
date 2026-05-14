# Arena economy + bot scoring fix

Fixed issues:
- Ranked Arena bots were scoring through a delayed timeout after the match had already advanced/finished.
  This made the opponent score unreliable and could let the player win even with very few correct answers.
- Survival and Power-Up Arena rewards were only applied when pressing Exit/Replay, so hub balances could look unchanged.
  Rewards now apply once when the result screen opens.
- Result screens now show coins/tokens awarded.
- Arena entry costs are clearer in the hub subtitles.
- Ranked rewards are win-only to prevent farming losses. No gems are awarded from Arena.

Notes:
- Typecheck could not be run in this extracted archive because node_modules/type definitions are not included.
- Test with `npx expo run:android`.
