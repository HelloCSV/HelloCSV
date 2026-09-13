import { useCallback, useRef, useState } from 'preact/hooks';
import { SheetState } from '../types';
import { MAX_UNDO_HISTORY } from '../constants';

export interface UndoRedo {
  canUndo: boolean;
  canRedo: boolean;
  /** Snapshot the current sheetData before a mutating operation. Clears redo. */
  record: (current: SheetState[]) => void;
  /** Restore the previous snapshot; pushes `current` onto the redo stack. */
  undo: (current: SheetState[]) => SheetState[] | null;
  /** Re-apply the next snapshot; pushes `current` onto the undo stack. */
  redo: (current: SheetState[]) => SheetState[] | null;
  /** Drop all history (e.g. when a fresh dataset is loaded). */
  reset: () => void;
}

// Deep clone so later in-place transformer mutations (see applyTransformations
// in the reducer) can't corrupt a stored snapshot. sheetData holds only plain
// data (strings/numbers/booleans/string[]), so structuredClone is sufficient.
function cloneSnapshot(sheetData: SheetState[]): SheetState[] {
  return structuredClone(sheetData);
}

/**
 * In-memory undo/redo history for the data editor. One snapshot of the whole
 * `sheetData` is recorded per user operation, so a single undo reverts an entire
 * mass action (e.g. a multi-cell paste). History is not persisted and resets on
 * reload.
 *
 * Stacks live in refs for synchronous reads inside undo/redo; a version counter
 * forces re-renders so `canUndo`/`canRedo` stay reactive for the toolbar.
 */
export function useUndoRedo(): UndoRedo {
  const undoStack = useRef<SheetState[][]>([]);
  const redoStack = useRef<SheetState[][]>([]);
  const [, setVersion] = useState(0);
  const rerender = useCallback(() => setVersion((n) => n + 1), []);

  const record = useCallback(
    (current: SheetState[]) => {
      undoStack.current.push(cloneSnapshot(current));

      if (undoStack.current.length > MAX_UNDO_HISTORY) {
        undoStack.current = undoStack.current.slice(-MAX_UNDO_HISTORY);
      }

      redoStack.current = [];

      rerender();
    },
    [rerender]
  );

  const undo = useCallback(
    (current: SheetState[]): SheetState[] | null => {
      if (undoStack.current.length === 0) return null;

      const target = undoStack.current.pop()!;
      redoStack.current.push(cloneSnapshot(current));

      rerender();

      return target;
    },
    [rerender]
  );

  const redo = useCallback(
    (current: SheetState[]): SheetState[] | null => {
      if (redoStack.current.length === 0) return null;

      const target = redoStack.current.pop()!;
      undoStack.current.push(cloneSnapshot(current));

      rerender();

      return target;
    },
    [rerender]
  );

  const reset = useCallback(() => {
    undoStack.current = [];
    redoStack.current = [];
    rerender();
  }, [rerender]);

  return {
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
    record,
    undo,
    redo,
    reset,
  };
}
