# Arena fixes applied

## Fixed
- Arena hub now shows exact entry cost and expected reward on every mode card.
- Arena entry costs are centralized in `src/arena/arenaEconomyRules.ts`.
- Entry costs were raised:
  - Ranked: 5 tickets
  - Survival: 6 tickets
  - Power-Up: 6 tickets
  - Tournament: 8 tickets
- Rewards no longer grant gems.
- Winner/strong-run rewards use ticket payouts tied to arena type:
  - Ranked win: 10 tickets
  - Power strong run: 12 tickets
  - Survival milestones: scaled ticket rewards up to 12 tickets
- Ranked, Survival, and Power result screens now show the reward summary.
- Survival timeout now plays wrong-answer feedback.
- Power-Up Arena timeout now plays wrong-answer feedback.
- Arena intro/countdown pacing shortened from 900ms to 700ms.
- Ranked internal start delay reduced from 1500ms to 600ms.

## Notes
- This patch keeps Play Billing untouched.
- This is intended for USB local testing with `npx expo run:android`.
