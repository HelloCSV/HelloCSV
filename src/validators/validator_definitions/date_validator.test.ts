import { describe, it, expect } from 'vitest';
import { DateValidator } from './date_validator';
import { DateValidatorDefinition } from '../types';

function makeValidator(overrides: Partial<DateValidatorDefinition> = {}) {
  return new DateValidator({
    validate: 'date',
    dateType: 'date',
    ...overrides,
  } as DateValidatorDefinition);
}

describe('DateValidator', () => {
  it('passes for empty cells (presence is required’s job)', () => {
    expect(makeValidator().isValid('')).toBeUndefined();
    expect(makeValidator().isValid(undefined)).toBeUndefined();
  });

  it('passes for a valid ISO date', () => {
    expect(makeValidator().isValid('2026-12-31')).toBeUndefined();
  });

  it('flags an unparseable value', () => {
    expect(makeValidator().isValid('not a date')).toBe('validators.date');
  });

  it('validates against a custom output format', () => {
    const v = makeValidator({ outputFormat: 'DD/MM/YYYY' });
    expect(v.isValid('31/12/2026')).toBeUndefined();
    expect(v.isValid('2026-12-31')).toBeUndefined(); // ISO fallback still accepted
  });

  it('uses the datetime / time message per dateType', () => {
    expect(makeValidator({ dateType: 'datetime' }).isValid('nope')).toBe(
      'validators.datetime'
    );
    expect(makeValidator({ dateType: 'time' }).isValid('nope')).toBe(
      'validators.time'
    );
  });

  it('honors a custom error message', () => {
    expect(makeValidator({ error: 'Bad date' }).isValid('nope')).toBe(
      'Bad date'
    );
  });

  it('enforces min/max bounds inclusively', () => {
    const v = makeValidator({ min: '2026-09-10', max: '2026-09-20' });
    expect(v.isValid('2026-09-10')).toBeUndefined();
    expect(v.isValid('2026-09-20')).toBeUndefined();
    expect(v.isValid('2026-09-15')).toBeUndefined();
    expect(v.isValid('2026-09-09')).toBe('validators.dateOutOfRange');
    expect(v.isValid('2026-09-21')).toBe('validators.dateOutOfRange');
  });

  it('enforces time-of-day bounds for datetime', () => {
    const v = makeValidator({
      dateType: 'datetime',
      min: '2026-09-10T09:00:00',
      max: '2026-09-10T17:00:00',
    });
    expect(v.isValid('2026-09-10T12:00:00')).toBeUndefined();
    expect(v.isValid('2026-09-10T08:00:00')).toBe('validators.dateOutOfRange');
  });
});
