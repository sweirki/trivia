# Sudden Death scoring fix

Issue:
- Quick Play Sudden Death advanced to the next question on correct answers.
- But the Sudden Death correct-answer branch returned before incrementing score/streak/combo/rewards.
- Result page therefore showed no calculated score/rewards after correct answers.

Fix:
- Correct Sudden Death answers now increment score, streak, combo, XP/coins/gems before advancing.
- Final result calculation now uses answerHistory for correctCount, so the summary is not dependent on score state timing.

Test:
1. Run `npx expo run:android`.
2. Quick Play → Sudden Death.
3. Answer 2+ questions correctly.
4. Answer one wrong.
5. Result page should show the correct score and rewards.
