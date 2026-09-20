import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import {
  parseDate,
  toStored,
  coerceDateValue,
  formatDisplay,
  buildMonthMatrix,
  dayIsOutOfRange,
} from './dateUtils';

describe('parseDate', () => {
  it('returns null for empty / whitespace / nullish input', () => {
    expect(parseDate('', 'date')).toBeNull();
    expect(parseDate('   ', 'date')).toBeNull();
    expect(parseDate(null, 'date')).toBeNull();
    expect(parseDate(undefined, 'date')).toBeNull();
  });

  it('parses ISO by default for each mode', () => {
    expect(parseDate('2026-12-31', 'date')!.format('YYYY-MM-DD')).toBe(
      '2026-12-31'
    );
    expect(
      parseDate('2026-12-31T10:30:00', 'datetime')!.format(
        'YYYY-MM-DDTHH:mm:ss'
      )
    ).toBe('2026-12-31T10:30:00');
    expect(parseDate('10:30:00', 'time')!.format('HH:mm:ss')).toBe('10:30:00');
  });

  it('parses a custom outputFormat', () => {
    expect(
      parseDate('31/12/2026', 'date', { outputFormat: 'DD/MM/YYYY' })!.format(
        'YYYY-MM-DD'
      )
    ).toBe('2026-12-31');
  });

  it('parses a custom displayFormat', () => {
    expect(
      parseDate('Dec 31, 2026', 'date', {
        displayFormat: 'MMM D, YYYY',
      })!.format('YYYY-MM-DD')
    ).toBe('2026-12-31');
  });

  it('returns null for garbage input (strict)', () => {
    expect(parseDate('not a date', 'date')).toBeNull();
    expect(parseDate('2026-13-45', 'date')).toBeNull();
  });
});

describe('toStored', () => {
  it('formats to the default (seconds-less) format per mode', () => {
    const d = dayjs('2026-12-31T10:30:15');
    expect(toStored(d, 'date')).toBe('2026-12-31');
    expect(toStored(d, 'datetime')).toBe('2026-12-31T10:30');
    expect(toStored(d, 'time')).toBe('10:30');
  });

  it('includes seconds when showSeconds is set', () => {
    const d = dayjs('2026-12-31T10:30:15');
    expect(toStored(d, 'datetime', { showSeconds: true })).toBe(
      '2026-12-31T10:30:15'
    );
    expect(toStored(d, 'time', { showSeconds: true })).toBe('10:30:15');
  });

  it('honors a custom outputFormat', () => {
    expect(
      toStored(dayjs('2026-12-31'), 'date', { outputFormat: 'DD/MM/YYYY' })
    ).toBe('31/12/2026');
  });

  it('returns empty string for null / invalid', () => {
    expect(toStored(null, 'date')).toBe('');
    expect(toStored(dayjs('nonsense'), 'date')).toBe('');
  });
});

describe('coerceDateValue', () => {
  it('keeps empty empty', () => {
    expect(coerceDateValue('', 'date')).toBe('');
    expect(coerceDateValue('   ', 'date')).toBe('');
  });

  it('normalizes a parseable value to outputFormat (default ISO)', () => {
    expect(
      coerceDateValue('31/12/2026', 'date', { outputFormat: 'DD/MM/YYYY' })
    ).toBe('31/12/2026');
    expect(
      coerceDateValue('Dec 31, 2026', 'date', { displayFormat: 'MMM D, YYYY' })
    ).toBe('2026-12-31');
  });

  it('round-trips an already-normalized ISO value', () => {
    expect(coerceDateValue('2026-12-31', 'date')).toBe('2026-12-31');
  });

  it('keeps unparseable input verbatim so a validator can flag it', () => {
    expect(coerceDateValue('not a date', 'date')).toBe('not a date');
  });
});

describe('formatDisplay', () => {
  it('formats a stored value with the default display per mode', () => {
    expect(formatDisplay('2026-12-31', 'date')).toBe('Dec 31, 2026');
    expect(formatDisplay('10:30:00', 'time')).toBe('10:30 AM');
  });

  it('honors a custom displayFormat', () => {
    expect(
      formatDisplay('2026-12-31', 'date', { displayFormat: 'DD/MM/YYYY' })
    ).toBe('31/12/2026');
  });

  it('displays time in 12h by default and 24h when configured', () => {
    expect(formatDisplay('13:30', 'time')).toBe('1:30 PM');
    expect(formatDisplay('13:30', 'time', { hourFormat: '24h' })).toBe('13:30');
  });

  it('returns empty for empty and raw for unparseable', () => {
    expect(formatDisplay('', 'date')).toBe('');
    expect(formatDisplay('not a date', 'date')).toBe('not a date');
  });
});

describe('buildMonthMatrix', () => {
  it('returns a stable 6x7 grid', () => {
    const matrix = buildMonthMatrix(dayjs('2026-09-15'));
    expect(matrix).toHaveLength(6);
    matrix.forEach((week) => expect(week).toHaveLength(7));
  });

  it('starts on the first day of the week and is contiguous', () => {
    const matrix = buildMonthMatrix(dayjs('2026-09-15'));
    const flat = matrix.flat();
    expect(flat[0].day()).toBe(0); // Sunday
    for (let i = 1; i < flat.length; i++) {
      expect(flat[i].diff(flat[i - 1], 'day')).toBe(1);
    }
  });

  it('includes every day of the target month', () => {
    const view = dayjs('2026-09-15');
    const flat = buildMonthMatrix(view).flat();
    const inMonth = flat.filter((d) => d.isSame(view, 'month'));
    expect(inMonth).toHaveLength(30); // September
  });
});

describe('dayIsOutOfRange', () => {
  const min = parseDate('2026-09-10', 'date');
  const max = parseDate('2026-09-20', 'date');

  it('is false with no bounds', () => {
    expect(dayIsOutOfRange(dayjs('2026-01-01'), null, null)).toBe(false);
  });

  it('flags days before min and after max (exclusive of the edges)', () => {
    expect(dayIsOutOfRange(dayjs('2026-09-09'), min, max)).toBe(true);
    expect(dayIsOutOfRange(dayjs('2026-09-21'), min, max)).toBe(true);
  });

  it('allows the inclusive min/max edges and interior days', () => {
    expect(dayIsOutOfRange(dayjs('2026-09-10'), min, max)).toBe(false);
    expect(dayIsOutOfRange(dayjs('2026-09-20'), min, max)).toBe(false);
    expect(dayIsOutOfRange(dayjs('2026-09-15'), min, max)).toBe(false);
  });
});
