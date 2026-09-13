/**
 * Decide what a single-select Combobox change should do, given the option the
 * user acted on and the currently-selected value.
 *
 * This encodes the grid-editing behaviour:
 * - Clearing the filter input makes headlessui emit a `null` change; in filter
 *   mode that must NOT clear the selection (returns 'ignore').
 * - Re-selecting the already-selected option toggles it off (returns null).
 * - Selecting a different option selects it.
 */
export function resolveSingleSelectChange<T>(
  selected: T | null,
  currentValue: T | null | undefined,
  opts: {
    searchInputAsFilter: boolean;
    compareFunction: (a: T, b: T) => boolean;
  }
): { type: 'ignore' } | { type: 'change'; value: T | null } {
  if (opts.searchInputAsFilter && selected == null) {
    return { type: 'ignore' };
  }
  if (
    selected != null &&
    currentValue != null &&
    opts.compareFunction(selected, currentValue as T)
  ) {
    return { type: 'change', value: null };
  }
  return { type: 'change', value: selected };
}
