import { describe, it, expect } from 'vitest';
import { reducer } from './reducer';
import { ImporterState, SheetState } from '../types';

function stateWith(sheetData: SheetState[]): ImporterState {
  return {
    sheetDefinitions: [],
    currentSheetId: 'people',
    mode: 'preview',
    validationErrors: [],
    validationInProgress: false,
    sheetData,
    importProgress: 0,
  };
}

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
