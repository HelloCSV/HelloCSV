/**
 * Runs `fn` over `items` with at most `limit` invocations in flight at once,
 * returning results in the original order. Used to throttle async validators
 * and transformers (e.g. LLM calls) so a large sheet can't fire hundreds of
 * requests simultaneously.
 *
 * Ordering guarantee: workers claim items in increasing index order and call
 * `fn` synchronously before awaiting, so the *synchronous* portion of each call
 * still runs in item order. This keeps order-dependent synchronous validators
 * (e.g. the `unique` validator's seen-set) deterministic even when sharing the
 * pool with slow async calls.
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R> | R
): Promise<R[]> {
  if (items.length === 0) return [];

  const effectiveLimit = Math.max(1, Math.min(limit, items.length));
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const current = nextIndex++;
      results[current] = await fn(items[current], current);
    }
  }

  await Promise.all(Array.from({ length: effectiveLimit }, () => worker()));

  return results;
}
