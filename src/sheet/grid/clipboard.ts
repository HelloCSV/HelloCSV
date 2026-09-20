import { useCallback, useRef } from 'preact/hooks';
import { ImporterOutputFieldType, SheetRow } from '@/types';
import { serializeRows } from '@/utils';
import { SheetColumnDefinition } from '../types';
import { formatCellValue } from '../valueCoercion';
import { isWithinBounds } from './coordinates';
import { CellChange, CellRange, GridDimensions } from './gridTypes';

export interface Clipboard {
  write: (text: string) => void;
  read: () => Promise<string>;
}

export function useClipboard(): Clipboard {
  const internalClipboard = useRef<string>('');

  const write = useCallback((text: string) => {
    internalClipboard.current = text;
    navigator.clipboard?.writeText?.(text).catch(() => {
      /* keep the internal buffer as fallback */
    });
  }, []);

  const read = useCallback(async () => {
    let text = '';
    try {
      text = (await navigator.clipboard?.readText?.()) ?? '';
    } catch {
      text = '';
    }
    if (!text) text = internalClipboard.current;
    return text;
  }, []);

  return { write, read };
}

export function serializeRange(
  cells: ImporterOutputFieldType[][],
  columns: SheetColumnDefinition[]
): string {
  const rows = cells.map((row) =>
    row.map((value, colOffset) => formatCellValue(columns[colOffset], value))
  );
  return serializeRows(rows, '\t');
}

/**
 * Map a pasted 2D block onto the grid, anchored at `target`.
 *
 * - Cells outside the grid bounds are dropped (clamped).
 * - Read-only target cells are skipped.
 * - When `block` is a single 1x1 cell and a multi-cell `selection` is provided,
 *   the value fills the entire selection (Google-Sheets behavior).
 *
 * Returns changes in *display* coordinates ({row, col}); the caller converts
 * the display row to a data row index at dispatch time.
 */
export function mapPasteBlock(
  block: string[][],
  target: { row: number; col: number },
  dims: GridDimensions,
  isEditable: (row: number, col: number) => boolean,
  selection?: CellRange
): Array<{ row: number; col: number; value: string }> {
  const changes: Array<{ row: number; col: number; value: string }> = [];

  const isSingleCell = block.length === 1 && block[0] && block[0].length === 1;

  if (isSingleCell && selection) {
    const value = block[0][0];
    for (let row = selection.top; row <= selection.bottom; row++) {
      for (let col = selection.left; col <= selection.right; col++) {
        if (isWithinBounds({ row, col }, dims) && isEditable(row, col)) {
          changes.push({ row, col, value });
        }
      }
    }
    return changes;
  }

  block.forEach((blockRow, rowOffset) => {
    blockRow.forEach((value, colOffset) => {
      const row = target.row + rowOffset;
      const col = target.col + colOffset;
      if (isWithinBounds({ row, col }, dims) && isEditable(row, col)) {
        changes.push({ row, col, value });
      }
    });
  });

  return changes;
}

/**
 * Coalesce per-cell changes into one merged row payload per data row.
 *
 * This is mandatory before dispatching a batch: `StateBuilder.changeCell`
 * accumulates build steps and each step carries a whole row, so unmerged
 * changes to the same row would clobber one another.
 */
export function groupChangesByRow(
  changes: CellChange[],
  rows: SheetRow[]
): Array<{ rowIndex: number; value: SheetRow }> {
  const byRow = new Map<number, SheetRow>();

  for (const change of changes) {
    let merged = byRow.get(change.rowIndex);
    if (!merged) {
      merged = { ...(rows[change.rowIndex] ?? {}) };
      byRow.set(change.rowIndex, merged);
    }
    merged[change.columnId] = change.value;
  }

  return Array.from(byRow.entries()).map(([rowIndex, value]) => ({
    rowIndex,
    value,
  }));
}
