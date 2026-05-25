import {
  dailyStatesEqual,
  pickNewestDaily,
  readPlayerVersion,
  shouldUseCloudPlayerState,
} from "@/store/player/player.syncPolicy";

describe("player sync policy", () => {
  it("uses cloud only when the cloud version is strictly newer", () => {
    expect(shouldUseCloudPlayerState(10, 11)).toBe(true);
    expect(shouldUseCloudPlayerState(10, 10)).toBe(false);
    expect(shouldUseCloudPlayerState(10, 9)).toBe(false);
  });

  it("normalizes invalid versions before comparing", () => {
    expect(readPlayerVersion(-5)).toBe(0);
    expect(readPlayerVersion(3.9)).toBe(3);
    expect(readPlayerVersion(Number.NaN)).toBe(0);
    expect(readPlayerVersion("4")).toBe(0);
  });

  it("keeps a newer local daily claim when the cloud snapshot is stale", () => {
    const selected = pickNewestDaily(
      { lastClaimDate: "2026-05-11", streak: 2, totalClaims: 2 },
      { lastClaimDate: "2026-05-10", streak: 1, totalClaims: 1 }
    );

    expect(selected).toEqual({
      lastClaimDate: "2026-05-11",
      streak: 2,
      totalClaims: 2,
    });
  });

  it("accepts a newer cloud daily claim when local storage is behind", () => {
    const selected = pickNewestDaily(
      { lastClaimDate: "2026-05-10", streak: 1, totalClaims: 1 },
      { lastClaimDate: "2026-05-11", streak: 2, totalClaims: 2 }
    );

    expect(selected).toEqual({
      lastClaimDate: "2026-05-11",
      streak: 2,
      totalClaims: 2,
    });
  });

  it("breaks same-day daily ties by total claim count", () => {
    const selected = pickNewestDaily(
      { lastClaimDate: "2026-05-11", streak: 2, totalClaims: 2 },
      { lastClaimDate: "2026-05-11", streak: 2, totalClaims: 3 }
    );

    expect(selected.totalClaims).toBe(3);
  });

  it("detects equivalent daily states after normalization", () => {
    expect(
      dailyStatesEqual(
        { lastClaimDate: "2026-05-11", streak: 2, totalClaims: 2 },
        { lastClaimDate: "2026-05-11", streak: 2, totalClaims: 2 }
      )
    ).toBe(true);

    expect(
      dailyStatesEqual(
        { lastClaimDate: "2026-05-11", streak: 2, totalClaims: 2 },
        { lastClaimDate: "2026-05-10", streak: 1, totalClaims: 1 }
      )
    ).toBe(false);
  });
});


