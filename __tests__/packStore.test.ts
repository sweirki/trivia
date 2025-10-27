import { incrementStatsForTest } from '../src/utils/stats';

describe('incrementStatsForTest', () => {
  it('should increment correct count', () => {
    const pack = { correctCount: 0, incorrectCount: 0, playCount: 0 };
    incrementStatsForTest(pack, true);
    expect(pack.correctCount).toBe(1);
    expect(pack.incorrectCount).toBe(0);
    expect(pack.playCount).toBe(1);
  });

  it('should increment incorrect count', () => {
    const pack = { correctCount: 0, incorrectCount: 0, playCount: 0 };
    incrementStatsForTest(pack, false);
    expect(pack.correctCount).toBe(0);
    expect(pack.incorrectCount).toBe(1);
    expect(pack.playCount).toBe(1);
  });
});