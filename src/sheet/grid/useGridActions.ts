import { useEffect, useMemo, useRef } from 'preact/hooks';
import { RefObject } from 'preact/compat';
import {
  CellChangedPayload,
  SheetDefinition,
  SheetRow,
  SheetState,
} from '@/types';
import { isEmptyCell } from '@/utils';
import { parseDelimitedText } from '@/parser';
import { ESTIMATED_ROW_HEIGHT } from '@/constants';
import { findRowIndex, isColumnReadOnly } from '../utils';
import { coerceCellValue, emptyValueForColumn } from '../valueCoercion';
import { useGridSelection, GridSelection } from './useGridSelection';
import { resolveKeyAction } from './keyboardReducer';
import { clampCoord, jumpToEdge, pageDelta } from './coordinates';
import {
  serializeRange,
  mapPasteBlock,
  groupChangesByRow,
  useClipboard,
} from './clipboard';
import { CellChange, CellCoord, GridDimensions } from './gridTypes';

interface UseGridActionsParams {
  sheetDefinition: SheetDefinition;
  /** The current sheet's state (source of truth for dispatched row payloads). */
  data: SheetState;
  /** The filtered/sorted rows currently displayed in the grid. */
  rowData: SheetRow[];
  /** All sheets' state, used to resolve a display row to its data row index. */
  allData: SheetState[];
  canEditRows: boolean;
  setRowsData: (payloads: CellChangedPayload[]) => void;
  /** Undo the last operation. Omitted when undo/redo is disabled. */
  undo?: () => void;
  /** Redo the last undone operation. Omitted when undo/redo is disabled. */
  redo?: () => void;
}

interface UseGridActionsResult {
  selection: GridSelection;
  dims: GridDimensions;
  tableContainerRef: RefObject<HTMLDivElement>;
  handleGridKeyDown: (e: KeyboardEvent) => void;
}

/**
 * Owns the keyboard grid: selection lifecycle, navigation, editing, clipboard
 * (copy/cut/paste), fill-down, and range clearing. Coordinates are in display
 * space (see gridTypes.CellCoord) and are converted to data coordinates only at
 * dispatch time (`applyDisplayChanges`).
 *
 * Returns the selection handle (for the grid context provider), the grid
 * dimensions, the scroll-container ref to attach, and the keydown handler.
 */
export function useGridActions({
  sheetDefinition,
  data,
  rowData,
  allData,
  canEditRows,
  setRowsData,
  undo,
  redo,
}: UseGridActionsParams): UseGridActionsResult {
  const selection = useGridSelection();
  const clipboard = useClipboard();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const dataColumns = sheetDefinition.columns;

  const dims: GridDimensions = useMemo(
    () => ({ rowCount: rowData.length, colCount: dataColumns.length }),
    [rowData.length, dataColumns.length]
  );

  useEffect(() => {
    selection.clampToBounds(dims);
    // clampToBounds is stable; only re-clamp when dimensions change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims.rowCount, dims.colCount]);

  useEffect(() => {
    const onMouseUp = () => selection.endDrag();
    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
    // selection.endDrag is stable (useCallback).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Latest selection for stable document-level listeners.
  const selectionRef = useRef(selection);
  selectionRef.current = selection;

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      const current = selectionRef.current;
      if (current.state.editing) return;
      const container = tableContainerRef.current;
      if (container && !container.contains(e.target as Node)) {
        current.reset();
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  const isCellEditableAt = (coord: CellCoord | null): boolean => {
    if (!coord) return false;

    const column = dataColumns[coord.col];
    if (!column) return false;

    return !isColumnReadOnly(column) && canEditRows;
  };

  const rawValueAt = (displayRow: number, col: number) =>
    rowData[displayRow]?.[dataColumns[col].id];

  const isEmptyAt = (displayRow: number, col: number) =>
    isEmptyCell(rawValueAt(displayRow, col));

  const resolveDataRowIndex = (displayRow: number) =>
    findRowIndex(allData, sheetDefinition.id, rowData[displayRow]);

  // Convert display-coordinate changes into merged, per-data-row payloads and
  // dispatch them under a single validation run.
  const applyDisplayChanges = (
    displayChanges: Array<{ row: number; col: number; value: SheetRow[string] }>
  ) => {
    if (displayChanges.length === 0) return;

    const cellChanges: CellChange[] = displayChanges.map((change) => ({
      rowIndex: resolveDataRowIndex(change.row),
      columnId: dataColumns[change.col].id,
      value: change.value,
    }));

    const grouped = groupChangesByRow(cellChanges, data.rows);

    setRowsData(
      grouped.map((payload) => ({
        sheetId: sheetDefinition.id,
        rowIndex: payload.rowIndex,
        value: payload.value,
      }))
    );
  };

  const executeCopy = () => {
    const range = selection.range;
    if (!range) return;

    const cells = [];
    for (let row = range.top; row <= range.bottom; row++) {
      const line = [];
      for (let col = range.left; col <= range.right; col++) {
        line.push(rawValueAt(row, col));
      }
      cells.push(line);
    }
    const tsv = serializeRange(
      cells,
      dataColumns.slice(range.left, range.right + 1)
    );
    clipboard.write(tsv);
  };

  const clearRange = () => {
    const range = selection.range;
    if (!range) return;

    const changes = [];
    for (let row = range.top; row <= range.bottom; row++) {
      for (let col = range.left; col <= range.right; col++) {
        if (isCellEditableAt({ row, col })) {
          changes.push({
            row,
            col,
            value: emptyValueForColumn(dataColumns[col]),
          });
        }
      }
    }

    applyDisplayChanges(changes);
  };

  const executeCut = () => {
    executeCopy();
    clearRange();
  };

  const executePaste = async () => {
    const active = selection.state.active;
    if (!active) return;

    const text = await clipboard.read();
    if (!text) return;

    const block = parseDelimitedText(text, '\t');
    if (block.length === 0) return;

    const placements = mapPasteBlock(
      block,
      active,
      dims,
      (row, col) => isCellEditableAt({ row, col }),
      selection.range ?? undefined
    );

    applyDisplayChanges(
      placements.map((placement) => ({
        row: placement.row,
        col: placement.col,
        value: coerceCellValue(dataColumns[placement.col], placement.value),
      }))
    );
  };

  const executeFillDown = () => {
    const range = selection.range;
    if (!range || range.bottom === range.top) return;

    const changes = [];
    for (let col = range.left; col <= range.right; col++) {
      const sourceValue = rawValueAt(range.top, col);
      for (let row = range.top + 1; row <= range.bottom; row++) {
        if (isCellEditableAt({ row, col })) {
          changes.push({ row, col, value: sourceValue });
        }
      }
    }

    applyDisplayChanges(changes);
  };

  const handleGridKeyDown = (e: KeyboardEvent) => {
    // Editing keys are handled by the active editor (see SheetDataEditorCell).
    if (selection.state.editing) return;

    const active = selection.state.active;

    // Page navigation depends on the viewport height, resolved here.
    if ((e.key === 'PageDown' || e.key === 'PageUp') && active) {
      const container = tableContainerRef.current;
      const delta = pageDelta(
        container?.clientHeight ?? 0,
        ESTIMATED_ROW_HEIGHT
      );

      const to = clampCoord(
        {
          row: active.row + (e.key === 'PageDown' ? delta : -delta),
          col: active.col,
        },
        dims
      );

      if (e.shiftKey) {
        selection.extendTo(to);
      } else {
        selection.setActive(to);
      }

      e.preventDefault();
      return;
    }

    const action = resolveKeyAction(
      {
        key: e.key,
        shiftKey: e.shiftKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        altKey: e.altKey,
      },
      selection.state,
      dims,
      isCellEditableAt
    );

    switch (action.type) {
      case 'MoveActive':
        selection.setActive(action.to);
        e.preventDefault();
        break;
      case 'ExtendSelection':
        selection.extendTo(action.to);
        e.preventDefault();
        break;
      case 'JumpEdge': {
        if (!active) break;

        const to = jumpToEdge(active, action.direction, dims, isEmptyAt);
        if (e.shiftKey) {
          selection.extendTo(to);
        } else {
          selection.setActive(to);
        }
        e.preventDefault();
        break;
      }
      case 'SelectAll':
        selection.selectAll(dims);
        e.preventDefault();
        break;
      case 'StartEdit':
        if (active) selection.startEdit(active, action.initialValue);
        e.preventDefault();
        break;
      case 'ClearCells':
        clearRange();
        e.preventDefault();
        break;
      case 'Copy':
        executeCopy();
        e.preventDefault();
        break;
      case 'Cut':
        executeCut();
        e.preventDefault();
        break;
      case 'Paste':
        void executePaste();
        e.preventDefault();
        break;
      case 'FillDown':
        executeFillDown();
        e.preventDefault();
        break;
      case 'Undo':
        // Only claim the key when undo/redo is enabled; otherwise let the
        // browser handle it natively.
        if (undo) {
          undo();
          e.preventDefault();
        }
        break;
      case 'Redo':
        if (redo) {
          redo();
          e.preventDefault();
        }
        break;
      case 'NoOp':
      default:
        break;
    }
  };

  return { selection, dims, tableContainerRef, handleGridKeyDown };
}
