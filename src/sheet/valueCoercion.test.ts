import { describe, it, expect } from 'vitest';
import {
  coerceCellValue,
  emptyValueForColumn,
  formatCellValue,
} from './valueCoercion';
import { SheetColumnDefinition } from './types';
import { ImporterOutputFieldType } from '@/types';

const numberCol = {
  id: 'n',
  label: 'N',
  type: 'number',
} as SheetColumnDefinition;
const stringCol = {
  id: 's',
  label: 'S',
  type: 'string',
} as SheetColumnDefinition;
const boolCol = {
  id: 'b',
  label: 'B',
  type: 'boolean',
  typeArguments: { trueLabel: 'Yes', falseLabel: 'No' },
} as SheetColumnDefinition;
const boolCustomCol = {
  id: 'b2',
  label: 'B2',
  type: 'boolean',
  typeArguments: { trueValues: ['on'], falseValues: ['off'] },
} as SheetColumnDefinition;
const enumCol = {
  id: 'e',
  label: 'E',
  type: 'enum',
  typeArguments: {
    multiple: false,
    values: [
      { label: 'Engineering', value: 'eng' },
      { label: 'Sales', value: 'sales' },
    ],
  },
} as SheetColumnDefinition;
const multiEnumCol = {
  id: 'e2',
  label: 'E2',
  type: 'enum',
  typeArguments: {
    multiple: true,
    delimiter: ';',
    values: [
      { label: 'JavaScript', value: 'js' },
      { label: 'Python', value: 'py' },
    ],
  },
} as SheetColumnDefinition;
const referenceCol = {
  id: 'r',
  label: 'R',
  type: 'reference',
  typeArguments: { sheetId: 'x', sheetColumnId: 'y' },
} as SheetColumnDefinition;

describe('coerceCellValue', () => {
  it('coerces numeric strings, keeps empty/non-numeric', () => {
    expect(coerceCellValue(numberCol, '42')).toBe(42);
    expect(coerceCellValue(numberCol, '3.5')).toBe(3.5);
    expect(coerceCellValue(numberCol, '')).toBe('');
    expect(coerceCellValue(numberCol, '12abc')).toBe('12abc');
    // Out of the safe float range -> kept raw (avoids lossy ID coercion).
    expect(coerceCellValue(numberCol, '99999999999999999999')).toBe(
      '99999999999999999999'
    );
  });

  it('parses booleans from labels and default tokens; unmatched -> raw', () => {
    expect(coerceCellValue(boolCol, 'Yes')).toBe(true);
    expect(coerceCellValue(boolCol, 'no')).toBe(false);
    expect(coerceCellValue(boolCol, 'TRUE')).toBe(true);
    expect(coerceCellValue(boolCol, '0')).toBe(false);
    expect(coerceCellValue(boolCol, 'maybe')).toBe('maybe');
  });

  it('honors custom trueValues/falseValues (falling back to defaults otherwise)', () => {
    expect(coerceCellValue(boolCustomCol, 'on')).toBe(true);
    expect(coerceCellValue(boolCustomCol, 'OFF')).toBe(false);
    // custom sets replace the defaults
    expect(coerceCellValue(boolCustomCol, 'yes')).toBe('yes');
  });

  it('resolves enum by value OR label -> value', () => {
    expect(coerceCellValue(enumCol, 'eng')).toBe('eng'); // by value
    expect(coerceCellValue(enumCol, 'Engineering')).toBe('eng'); // by label
    expect(coerceCellValue(enumCol, 'nope')).toBe('nope'); // unmatched -> raw
    expect(coerceCellValue(enumCol, '')).toBe(''); // empty -> raw
  });

  it('splits multi-enum on the delimiter and resolves each token', () => {
    expect(coerceCellValue(multiEnumCol, 'JavaScript;py')).toEqual([
      'js',
      'py',
    ]);
    expect(coerceCellValue(multiEnumCol, ' js ; Python ')).toEqual([
      'js',
      'py',
    ]);
    expect(coerceCellValue(multiEnumCol, '')).toEqual([]);
  });

  it('leaves string and reference values as raw', () => {
    expect(coerceCellValue(stringCol, 'hello')).toBe('hello');
    expect(coerceCellValue(referenceCol, 'ref-value')).toBe('ref-value');
  });
});

describe('formatCellValue', () => {
  it('stringifies numbers, strings and single enums', () => {
    expect(formatCellValue(numberCol, 42)).toBe('42');
    expect(formatCellValue(stringCol, 'hello')).toBe('hello');
    expect(formatCellValue(enumCol, 'eng')).toBe('eng');
  });

  it('joins multi-enum arrays with the column delimiter', () => {
    expect(formatCellValue(multiEnumCol, ['js', 'py'])).toBe('js;py');
    expect(formatCellValue(multiEnumCol, [])).toBe('');
  });

  it('emits boolean tokens the column will coerce back', () => {
    expect(formatCellValue(boolCol, true)).toBe('Yes'); // trueLabel
    expect(formatCellValue(boolCol, false)).toBe('No');
    expect(formatCellValue(boolCustomCol, true)).toBe('on'); // custom trueValues[0]
    expect(formatCellValue(boolCustomCol, false)).toBe('off');
  });

  it('renders empty/null as an empty string', () => {
    expect(formatCellValue(numberCol, '')).toBe('');
    expect(formatCellValue(stringCol, null as unknown as string)).toBe('');
  });

  it('round-trips format -> coerce for each column type', () => {
    const cases: Array<[SheetColumnDefinition, ImporterOutputFieldType]> = [
      [numberCol, 42],
      [stringCol, 'hello'],
      [enumCol, 'eng'],
      [multiEnumCol, ['js', 'py']],
      [boolCol, true],
      [boolCol, false],
      [boolCustomCol, true],
      [boolCustomCol, false],
    ];
    for (const [column, value] of cases) {
      expect(coerceCellValue(column, formatCellValue(column, value))).toEqual(
        value
      );
    }
  });
});

describe('emptyValueForColumn', () => {
  it('returns [] for multi-enum, else empty string', () => {
    expect(emptyValueForColumn(multiEnumCol)).toEqual([]);
    expect(emptyValueForColumn(enumCol)).toBe('');
    expect(emptyValueForColumn(numberCol)).toBe('');
  });
});

const dateCol = {
  id: 'd',
  label: 'D',
  type: 'date',
} as SheetColumnDefinition;
const dateCustomCol = {
  id: 'd2',
  label: 'D2',
  type: 'date',
  typeArguments: { outputFormat: 'DD/MM/YYYY' },
} as SheetColumnDefinition;
const datetimeCol = {
  id: 'dt',
  label: 'DT',
  type: 'datetime',
} as SheetColumnDefinition;
const timeCol = {
  id: 't',
  label: 'T',
  type: 'time',
} as SheetColumnDefinition;

describe('coerceCellValue - date types', () => {
  it('normalizes ISO date input', () => {
    expect(coerceCellValue(dateCol, '2026-12-31')).toBe('2026-12-31');
  });

  it('normalizes to a custom output format', () => {
    expect(coerceCellValue(dateCustomCol, '2026-12-31')).toBe('31/12/2026');
  });

  it('normalizes datetime and time, dropping seconds by default', () => {
    expect(coerceCellValue(datetimeCol, '2026-12-31T10:30:00')).toBe(
      '2026-12-31T10:30'
    );
    expect(coerceCellValue(timeCol, '10:30:00')).toBe('10:30');
  });

  it('keeps seconds when the column sets showSeconds', () => {
    const timeSecondsCol = {
      id: 'ts',
      label: 'TS',
      type: 'time',
      typeArguments: { showSeconds: true },
    } as SheetColumnDefinition;
    expect(coerceCellValue(timeSecondsCol, '10:30:15')).toBe('10:30:15');
  });

  it('keeps empty empty and unparseable verbatim', () => {
    expect(coerceCellValue(dateCol, '')).toBe('');
    expect(coerceCellValue(dateCol, 'not a date')).toBe('not a date');
  });

  it('round-trips through formatCellValue -> coerceCellValue', () => {
    const cases: [SheetColumnDefinition, ImporterOutputFieldType][] = [
      [dateCol, '2026-12-31'],
      [dateCustomCol, '31/12/2026'],
      [datetimeCol, '2026-12-31T10:30'],
      [timeCol, '10:30'],
    ];
    for (const [column, value] of cases) {
      expect(coerceCellValue(column, formatCellValue(column, value))).toEqual(
        value
      );
    }
  });
});
