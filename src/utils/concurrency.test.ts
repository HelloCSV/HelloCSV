import { describe, it, expect } from 'vitest';
import { mapWithConcurrency } from './concurrency';

describe('mapWithConcurrency', () => {
  it('returns results in the original order', async () => {
    const results = await mapWithConcurrency([1, 2, 3, 4], 2, async (n) => {
      await Promise.resolve();
      return n * 2;
    });
    expect(results).toEqual([2, 4, 6, 8]);
  });

  it('never exceeds the concurrency limit', async () => {
    let inFlight = 0;
    let maxInFlight = 0;

    await mapWithConcurrency(
      Array.from({ length: 50 }, (_, i) => i),
      5,
      async () => {
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await Promise.resolve();
        await Promise.resolve();
        inFlight -= 1;
      }
    );

    expect(maxInFlight).toBeLessThanOrEqual(5);
  });

  it('handles an empty list', async () => {
    expect(await mapWithConcurrency([], 4, async () => 1)).toEqual([]);
  });

  it('passes the index to the mapper', async () => {
    const results = await mapWithConcurrency(['a', 'b', 'c'], 2, (item, i) => ({
      item,
      i,
    }));
    expect(results).toEqual([
      { item: 'a', i: 0 },
      { item: 'b', i: 1 },
      { item: 'c', i: 2 },
    ]);
  });
});
