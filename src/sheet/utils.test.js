import { describe, it, expect } from 'vitest';
import { buildMultiEnumEditorOptions } from './utils';

const VALUES = [
  { label: 'Python', value: 'python' },
  { label: 'Data Analysis', value: 'data_analysis' },
];

const makeLabel = (raw) => `${raw} (invalid)`;
const ICON = 'ICON';

describe('buildMultiEnumEditorOptions', () => {
  it('prepends a warning pseudo-option for each value not in the valid options', () => {
    const result = buildMultiEnumEditorOptions(
      ['python', 'data_analysiss'],
      VALUES,
      makeLabel,
      ICON
    );

    expect(result).toEqual([
      {
        label: 'data_analysiss (invalid)',
        value: 'data_analysiss',
        icon: ICON,
      },
      ...VALUES,
    ]);
  });

  it('returns options unchanged when every value is valid', () => {
    const result = buildMultiEnumEditorOptions(
      ['python', 'data_analysis'],
      VALUES,
      makeLabel,
      ICON
    );

    expect(result).toEqual(VALUES);
  });

  it('returns options unchanged for empty, null or non-array values', () => {
    expect(buildMultiEnumEditorOptions([], VALUES, makeLabel, ICON)).toEqual(
      VALUES
    );
    expect(buildMultiEnumEditorOptions(null, VALUES, makeLabel, ICON)).toEqual(
      VALUES
    );
    expect(
      buildMultiEnumEditorOptions('python', VALUES, makeLabel, ICON)
    ).toEqual(VALUES);
  });

  it('creates a pseudo-option for each distinct invalid value', () => {
    const result = buildMultiEnumEditorOptions(
      ['foo', 'python', 'bar'],
      VALUES,
      makeLabel,
      ICON
    );

    expect(result).toEqual([
      { label: 'foo (invalid)', value: 'foo', icon: ICON },
      { label: 'bar (invalid)', value: 'bar', icon: ICON },
      ...VALUES,
    ]);
  });
});
