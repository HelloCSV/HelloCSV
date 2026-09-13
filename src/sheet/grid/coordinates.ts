import {
  CellCoord,
  CellRange,
  GridDimensions,
  MoveDirection,
} from './gridTypes';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Clamp a coordinate into the grid bounds. */
export function clampCoord(coord: CellCoord, dims: GridDimensions): CellCoord {
  return {
    row: clamp(coord.row, 0, Math.max(0, dims.rowCount - 1)),
    col: clamp(coord.col, 0, Math.max(0, dims.colCount - 1)),
  };
}

const DELTAS: Record<MoveDirection, CellCoord> = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
};

/** Move one step in a direction, clamping (no wrapping) at the edges. */
export function moveCoord(
  coord: CellCoord,
  direction: MoveDirection,
  dims: GridDimensions
): CellCoord {
  const delta = DELTAS[direction];
  return clampCoord(
    { row: coord.row + delta.row, col: coord.col + delta.col },
    dims
  );
}

/**
 * Build a normalized rectangular range from an anchor and the active cell.
 * A null anchor is treated as the active cell (single-cell range).
 */
export function rangeFromAnchor(
  anchor: CellCoord | null,
  active: CellCoord
): CellRange {
  const a = anchor ?? active;

  return {
    top: Math.min(a.row, active.row),
    left: Math.min(a.col, active.col),
    bottom: Math.max(a.row, active.row),
    right: Math.max(a.col, active.col),
  };
}

export function isWithinRange(coord: CellCoord, range: CellRange): boolean {
  return (
    coord.row >= range.top &&
    coord.row <= range.bottom &&
    coord.col >= range.left &&
    coord.col <= range.right
  );
}

/** Whether a coordinate falls inside the grid's dimensions. */
export function isWithinBounds(
  coord: CellCoord,
  dims: GridDimensions
): boolean {
  return (
    coord.row >= 0 &&
    coord.row < dims.rowCount &&
    coord.col >= 0 &&
    coord.col < dims.colCount
  );
}

/**
 * Google-Sheets-style Ctrl+Arrow edge jump.
 *
 * - If the next cell in the direction is empty, jump to the next non-empty cell
 *   (skipping the run of empties).
 * - If the next cell is non-empty, jump to the last non-empty cell before the
 *   next empty cell (the end of the current data block).
 * - If nothing matches ahead, land on the grid boundary.
 *
 * `isEmpty(row, col)` reports whether a *displayed* cell is empty.
 */
export function jumpToEdge(
  from: CellCoord,
  direction: MoveDirection,
  dims: GridDimensions,
  isEmpty: (row: number, col: number) => boolean
): CellCoord {
  const delta = DELTAS[direction];
  const inBounds = (row: number, col: number) =>
    isWithinBounds({ row, col }, dims);

  const next = { row: from.row + delta.row, col: from.col + delta.col };
  if (!inBounds(next.row, next.col)) {
    return from;
  }

  const startsOnEmpty = isEmpty(next.row, next.col);
  let current = { ...from };
  let candidate = { ...next };

  while (inBounds(candidate.row, candidate.col)) {
    const candidateEmpty = isEmpty(candidate.row, candidate.col);
    if (startsOnEmpty) {
      // Skipping empties: stop on the first non-empty cell.
      if (!candidateEmpty) {
        return candidate;
      }
    } else {
      // Traversing a block: stop at the last non-empty before an empty.
      if (candidateEmpty) {
        return current;
      }
    }
    current = { ...candidate };
    candidate = {
      row: candidate.row + delta.row,
      col: candidate.col + delta.col,
    };
  }

  // Reached the boundary without a stopping condition.
  return current;
}

/** Number of rows to move for PageUp/PageDown given the viewport. */
export function pageDelta(
  containerHeightPx: number,
  rowHeightPx: number
): number {
  if (rowHeightPx <= 0) return 1;
  return Math.max(1, Math.floor(containerHeightPx / rowHeightPx));
}

/**
 * Convert a data-column index to the index within a row's visible cells,
 * accounting for the leading checkbox column when present.
 */
export function dataColToVisibleCellIndex(
  dataCol: number,
  hasCheckboxColumn: boolean
): number {
  return dataCol + (hasCheckboxColumn ? 1 : 0);
}

/** Inverse of {@link dataColToVisibleCellIndex}. */
export function visibleCellIndexToDataCol(
  cellIndex: number,
  hasCheckboxColumn: boolean
): number {
  return cellIndex - (hasCheckboxColumn ? 1 : 0);
}
