// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/preact';

// Mutable state the mocked context hooks read from. Set per test.
const mocks = vi.hoisted(() => ({
  definition: {} as {
    sheets: any[];
    preventUploadOnValidationErrors?: any;
  },
  state: {} as { sheetData: any[]; validationErrors: any[] },
}));

vi.mock('./hooks', () => ({
  useImporterDefinition: () => mocks.definition,
}));

vi.mock('./reducer', () => ({
  useImporterState: () => mocks.state,
}));

vi.mock('@/i18', () => ({
  // Echo the key + args so assertions can verify which message was built.
  useTranslations: () => ({
    t: (key: string, args?: Record<string, string>) =>
      args ? `${key} ${JSON.stringify(args)}` : key,
  }),
}));

import { useSheetRowLimits } from './useSheetRowLimits';

const sheet = (id: string, maxRows?: number) => ({
  id,
  label: id.toUpperCase(),
  columns: [],
  ...(maxRows != null ? { maxRows } : {}),
});
const rows = (n: number) => Array.from({ length: n }, () => ({ key: 'v' }));

function setup({
  sheets,
  sheetData,
  validationErrors = [],
  preventUploadOnValidationErrors,
}: {
  sheets: any[];
  sheetData: any[];
  validationErrors?: any[];
  preventUploadOnValidationErrors?: any;
}) {
  mocks.definition = { sheets, preventUploadOnValidationErrors };
  mocks.state = { sheetData, validationErrors };
  return renderHook(() => useSheetRowLimits()).result.current;
}

describe('useSheetRowLimits', () => {
  beforeEach(() => {
    mocks.definition = { sheets: [] };
    mocks.state = { sheetData: [], validationErrors: [] };
  });

  it('omits sheets without a limit and reports none exceeded', () => {
    const result = setup({
      sheets: [sheet('a')],
      sheetData: [{ sheetId: 'a', rows: rows(100) }],
    });

    expect(result.limits).toEqual([]);
    expect(result.byId).toEqual({});
    expect(result.hasExceeded).toBe(false);
    expect(result.preventUpload).toBe(false);
  });

  it('builds per-sheet info and tooltip for limited sheets', () => {
    const result = setup({
      sheets: [sheet('a', 5)],
      sheetData: [{ sheetId: 'a', rows: rows(3) }],
    });

    expect(result.byId.a).toMatchObject({
      count: 3,
      maxRows: 5,
      exceeded: false,
    });
    expect(result.byId.a.tooltip).toBe(
      `importer.rowLimitExceeded ${JSON.stringify({
        sheet: 'A',
        count: '3',
        limit: '5',
      })}`
    );
    expect(result.hasExceeded).toBe(false);
    expect(result.preventUpload).toBe(false);
  });

  it('flags an exceeded sheet and blocks upload with its message', () => {
    const result = setup({
      sheets: [sheet('a', 5)],
      sheetData: [{ sheetId: 'a', rows: rows(6) }],
    });

    expect(result.hasExceeded).toBe(true);
    expect(result.exceeded.map((l) => l.sheetId)).toEqual(['a']);
    expect(result.preventUpload).toBe(true);
    expect(result.uploadBlockedTooltip).toBe(
      `importer.rowLimitExceeded ${JSON.stringify({
        sheet: 'A',
        count: '6',
        limit: '5',
      })}`
    );
  });

  it('summarizes multiple exceeded sheets in the upload tooltip', () => {
    const result = setup({
      sheets: [sheet('a', 5), sheet('b', 2)],
      sheetData: [
        { sheetId: 'a', rows: rows(6) },
        { sheetId: 'b', rows: rows(10) },
      ],
    });

    expect(result.exceeded.map((l) => l.sheetId)).toEqual(['a', 'b']);
    expect(result.uploadBlockedTooltip).toBe(
      `importer.rowLimitExceededMultiple ${JSON.stringify({
        sheets: 'A (6/5), B (10/2)',
      })}`
    );
  });

  it('does not count empty rows toward the limit', () => {
    const result = setup({
      sheets: [sheet('a', 5)],
      sheetData: [{ sheetId: 'a', rows: [...rows(3), {}, {}, {}, {}, {}] }],
    });

    expect(result.byId.a).toMatchObject({ count: 3, exceeded: false });
    expect(result.hasExceeded).toBe(false);
  });

  it('blocks upload on validation errors and falls back to the generic tooltip', () => {
    const result = setup({
      sheets: [sheet('a')],
      sheetData: [{ sheetId: 'a', rows: rows(2) }],
      validationErrors: [{ sheetId: 'a' }],
      preventUploadOnValidationErrors: true,
    });

    expect(result.hasExceeded).toBe(false);
    expect(result.preventUpload).toBe(true);
    expect(result.uploadBlockedTooltip).toBe('importer.uploadBlocked');
  });

  it('does not block on validation errors when the flag is off', () => {
    const result = setup({
      sheets: [sheet('a')],
      sheetData: [{ sheetId: 'a', rows: rows(2) }],
      validationErrors: [{ sheetId: 'a' }],
      preventUploadOnValidationErrors: false,
    });

    expect(result.preventUpload).toBe(false);
  });

  it('supports a predicate for preventUploadOnValidationErrors', () => {
    const result = setup({
      sheets: [sheet('a')],
      sheetData: [{ sheetId: 'a', rows: rows(2) }],
      validationErrors: [{ sheetId: 'a' }],
      preventUploadOnValidationErrors: (errors: any[]) => errors.length > 0,
    });

    expect(result.preventUpload).toBe(true);
  });

  it('row-limit breach blocks upload even if validation prevention is off', () => {
    const result = setup({
      sheets: [sheet('a', 1)],
      sheetData: [{ sheetId: 'a', rows: rows(5) }],
      validationErrors: [],
      preventUploadOnValidationErrors: false,
    });

    expect(result.preventUpload).toBe(true);
    expect(result.uploadBlockedTooltip).toContain('importer.rowLimitExceeded');
  });
});
