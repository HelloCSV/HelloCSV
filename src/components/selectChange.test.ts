import { describe, it, expect } from 'vitest';
import { resolveSingleSelectChange } from './selectChange';

const opts = {
  searchInputAsFilter: true,
  compareFunction: (a: string, b: string) => a === b,
};

describe('resolveSingleSelectChange', () => {
  it('ignores a null change in filter mode (clearing the filter keeps the value)', () => {
    expect(resolveSingleSelectChange(null, 'python', opts)).toEqual({
      type: 'ignore',
    });
  });

  it('toggles off when re-selecting the current value', () => {
    expect(resolveSingleSelectChange('python', 'python', opts)).toEqual({
      type: 'change',
      value: null,
    });
  });

  it('selects a different option', () => {
    expect(resolveSingleSelectChange('sql', 'python', opts)).toEqual({
      type: 'change',
      value: 'sql',
    });
  });

  it('selects an option when nothing is selected yet', () => {
    expect(resolveSingleSelectChange('sql', null, opts)).toEqual({
      type: 'change',
      value: 'sql',
    });
  });

  it('when not in filter mode, a null change clears the value (legacy behaviour)', () => {
    expect(
      resolveSingleSelectChange(null, 'python', {
        ...opts,
        searchInputAsFilter: false,
      })
    ).toEqual({ type: 'change', value: null });
  });
});
