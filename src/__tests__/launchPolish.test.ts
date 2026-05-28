import { getLaunchPolishChecklistScore, getPostMatchLaunchAction } from "@/polish/launchPolish";

describe("launchPolish", () => {
  it("prioritizes challenge rematch psychology", () => {
    const action = getPostMatchLaunchAction({
      accuracy: 100,
      score: 10,
      totalQuestions: 10,
      earnedXP: 50,
      earnedCoins: 25,
      earnedGems: 0,
      earnedTickets: 0,
      hasChallenge: true,
    });

    expect(action.eyebrow).toBe("RIVALRY MOMENT");
  });

  it("scores launch checklist flags", () => {
    const score = getLaunchPolishChecklistScore({
      hasSocialEntry: true,
      hasDailyEntry: true,
      hasStoreEntry: true,
      hasSettingsEntry: false,
      hasObservableEnv: true,
    });

    expect(score).toEqual({ passed: 4, total: 5, percent: 80 });
  });
});


