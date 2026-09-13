import { ImporterOutputFieldType } from '@/types';

/**
 * A cell coordinate in *display* space.
 *
 * `row` is the index into the currently displayed row model
 * (`table.getRowModel().rows`, i.e. post filter/sort/search), NOT the underlying
 * data row index. `col` is the index into the sheet's *data* columns
 * (`sheetDefinition.columns`) and therefore excludes the checkbox column.
 *
 * Display coordinates are converted to a data row index (via `findRowIndex`)
 * only at dispatch time — see `resolveDataRowIndex` in the selection hook.
 */
export interface CellCoord {
  row: number;
  col: number;
}

/**
 * How the editor should seed its value when editing starts.
 * - `preserve`: keep the current value (F2 / double-click).
 * - `{ char }`: type-to-edit — start with the typed character.
 */
export type EditInitialValue = 'preserve' | { char: string };

export interface GridSelectionState {
  /** The cursor cell; also the roving-tabindex target. */
  active: CellCoord | null;
  /** Selection anchor for Shift+range extension; null => single-cell selection. */
  anchor: CellCoord | null;
  /** The single grid-level editing coordinate (replaces per-cell editMode). */
  editing: CellCoord | null;
  /** How the active editor should seed its value. */
  editInitialValue: EditInitialValue;
}

/** Dimensions of the navigable grid, in display/data-column space. */
export interface GridDimensions {
  /** Number of displayed rows. */
  rowCount: number;
  /** Number of navigable data columns (excludes the checkbox column). */
  colCount: number;
}

/** A normalized rectangular selection range (inclusive bounds). */
export interface CellRange {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export type MoveDirection = 'up' | 'down' | 'left' | 'right';

/** A single cell edit expressed in data coordinates, ready to dispatch. */
export interface CellChange {
  rowIndex: number;
  columnId: string;
  value: ImporterOutputFieldType;
}

/** A minimal, serializable description of a keyboard event. */
export interface KeyDescriptor {
  key: string;
  shiftKey: boolean;
  /** Ctrl on Windows/Linux. */
  ctrlKey: boolean;
  /** Cmd on macOS. */
  metaKey: boolean;
  /** Alt/Option — excluded from type-to-edit so accent/shortcut combos don't edit. */
  altKey?: boolean;
}

/**
 * The resolved intent of a key press, decoupled from the DOM so it can be
 * unit-tested exhaustively. Coordinates in these actions are already clamped to
 * the grid bounds.
 */
export type GridAction =
  | { type: 'NoOp' }
  | { type: 'MoveActive'; to: CellCoord }
  | { type: 'ExtendSelection'; to: CellCoord }
  | { type: 'JumpEdge'; direction: MoveDirection }
  | { type: 'SelectAll' }
  | { type: 'StartEdit'; initialValue: EditInitialValue }
  | { type: 'CommitAndMove'; direction: MoveDirection }
  | { type: 'CancelEdit' }
  | { type: 'ClearCells' }
  | { type: 'Copy' }
  | { type: 'Cut' }
  | { type: 'Paste' }
  | { type: 'FillDown' }
  | { type: 'Undo' }
  | { type: 'Redo' };
