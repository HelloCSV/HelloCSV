// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/preact';
import { useUndoRedo } from './useUndoRedo';
import { SheetState } from '../types';
import { MAX_UNDO_HISTORY } from '../constants';

function snapshot(marker: string): SheetState[] {
  return [{ sheetId: 'a', rows: [{ name: marker }] }];
}

describe('useUndoRedo', () => {
  it('starts empty with nothing to undo or redo', () => {
    const { result } = renderHook(() => useUndoRedo());
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.undo(snapshot('now'))).toBeNull();
    expect(result.current.redo(snapshot('now'))).toBeNull();
  });

  it('records a snapshot and restores it on undo, then redoes it', () => {
    const { result } = renderHook(() => useUndoRedo());

    act(() => result.current.record(snapshot('v1')));
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);

    let restored: SheetState[] | null = null;
    act(() => {
      restored = result.current.undo(snapshot('v2'));
    });
    expect(restored).toEqual(snapshot('v1'));
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);

    let redone: SheetState[] | null = null;
    act(() => {
      redone = result.current.redo(snapshot('v1'));
    });
    expect(redone).toEqual(snapshot('v2'));
    expect(result.current.canRedo).toBe(false);
  });

  it('clears the redo stack when a new snapshot is recorded', () => {
    const { result } = renderHook(() => useUndoRedo());

    act(() => result.current.record(snapshot('v1')));
    act(() => {
      result.current.undo(snapshot('v2'));
    });
    expect(result.current.canRedo).toBe(true);

    act(() => result.current.record(snapshot('v3')));
    expect(result.current.canRedo).toBe(false);
  });

  it('deep-clones snapshots so later mutation cannot corrupt history', () => {
    const { result } = renderHook(() => useUndoRedo());
    const live = snapshot('original');

    act(() => result.current.record(live));
    // Mutate the live data in place after recording.
    live[0].rows[0].name = 'mutated';

    let restored: SheetState[] | null = null;
    act(() => {
      restored = result.current.undo(live);
    });
    expect(restored![0].rows[0].name).toBe('original');
  });

  it('caps the undo stack at MAX_UNDO_HISTORY entries', () => {
    const { result } = renderHook(() => useUndoRedo());

    act(() => {
      for (let i = 0; i < MAX_UNDO_HISTORY + 10; i++) {
        result.current.record(snapshot(`v${i}`));
      }
    });

    // Undo exactly MAX_UNDO_HISTORY times succeeds; the next one is empty.
    for (let i = 0; i < MAX_UNDO_HISTORY; i++) {
      let restored: SheetState[] | null = null;
      act(() => {
        restored = result.current.undo(snapshot('cur'));
      });
      expect(restored).not.toBeNull();
    }
    expect(result.current.canUndo).toBe(false);
  });

  it('reset clears both stacks', () => {
    const { result } = renderHook(() => useUndoRedo());
    act(() => result.current.record(snapshot('v1')));
    act(() => {
      result.current.undo(snapshot('v2'));
    });
    act(() => result.current.reset());
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });
});
