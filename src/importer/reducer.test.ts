import { describe, it, expect } from 'vitest';
import { reducer } from './reducer';
import { ImporterState, SheetState } from '../types';

function stateWith(sheetData: SheetState[]): ImporterState {
  return {
    sheetDefinitions: [],
    currentSheetId: 'people',
    mode: 'preview',
    validationErrors: [],
    processingInProgress: false,
    sheetData,
    importProgress: 0,
  };
}

describe('reducer — PROCESSING_COMPLETED', () => {
  const transformed: SheetState[] = [
    { sheetId: 'people', rows: [{ name: 'TRANSFORMED' }] },
  ];
  const errors = [
    { sheetId: 'people', rowIndex: 0, columnId: 'name', message: 'oops' },
  ];

  it('applies transformed sheetData + errors when the runId matches', () => {
    const current = {
      ...stateWith([{ sheetId: 'people', rows: [{ name: 'raw' }] }]),
      processingInProgress: true,
      processingRunId: 'run-1',
    };

    const next = reducer(current, {
      type: 'PROCESSING_COMPLETED',
      payload: { sheetData: transformed, errors, runId: 'run-1' },
    });

    expect(next.sheetData).toEqual(transformed);
    expect(next.validationErrors).toEqual(errors);
    expect(next.processingInProgress).toBe(false);
    expect(next.processingRunId).toBeUndefined();
  });

  it('drops a stale pass whose runId no longer matches', () => {
    const current = {
      ...stateWith([{ sheetId: 'people', rows: [{ name: 'newer-raw' }] }]),
      processingInProgress: true,
      processingRunId: 'run-2',
    };

    const next = reducer(current, {
      type: 'PROCESSING_COMPLETED',
      payload: { sheetData: transformed, errors, runId: 'run-1' },
    });

    // Stale result is ignored — neither data nor errors are overwritten.
    expect(next).toBe(current);
  });
});

describe('reducer — RESTORE_SHEET_DATA', () => {
  it('replaces sheetData wholesale with the provided snapshot', () => {
    const current = stateWith([
      { sheetId: 'people', rows: [{ name: 'edited' }] },
    ]);
    const snapshot: SheetState[] = [
      { sheetId: 'people', rows: [{ name: 'original' }] },
    ];

    const next = reducer(current, {
      type: 'RESTORE_SHEET_DATA',
      payload: { sheetData: snapshot },
    });

    expect(next.sheetData).toEqual(snapshot);
    // Other state is preserved.
    expect(next.mode).toBe('preview');
    expect(next.currentSheetId).toBe('people');
  });
});
