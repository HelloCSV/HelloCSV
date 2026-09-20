import { describe, it, expect } from 'vitest';
import {
  clampCoord,
  moveCoord,
  rangeFromAnchor,
  isWithinRange,
  isWithinBounds,
  jumpToEdge,
  pageDelta,
  dataColToVisibleCellIndex,
  visibleCellIndexToDataCol,
} from './coordinates';

const DIMS = { rowCount: 5, colCount: 3 };

describe('clampCoord', () => {
  it('keeps an in-bounds coord unchanged', () => {
    expect(clampCoord({ row: 2, col: 1 }, DIMS)).toEqual({ row: 2, col: 1 });
  });

  it('clamps below zero to zero', () => {
    expect(clampCoord({ row: -3, col: -1 }, DIMS)).toEqual({ row: 0, col: 0 });
  });

  it('clamps above bounds to the last index', () => {
    expect(clampCoord({ row: 99, col: 99 }, DIMS)).toEqual({ row: 4, col: 2 });
  });
});

describe('moveCoord', () => {
  it('moves within bounds', () => {
    expect(moveCoord({ row: 1, col: 1 }, 'down', DIMS)).toEqual({
      row: 2,
      col: 1,
    });
    expect(moveCoord({ row: 1, col: 1 }, 'right', DIMS)).toEqual({
      row: 1,
      col: 2,
    });
  });

  it('clamps at the edges instead of wrapping', () => {
    expect(moveCoord({ row: 0, col: 0 }, 'up', DIMS)).toEqual({
      row: 0,
      col: 0,
    });
    expect(moveCoord({ row: 4, col: 2 }, 'down', DIMS)).toEqual({
      row: 4,
      col: 2,
    });
    expect(moveCoord({ row: 4, col: 2 }, 'right', DIMS)).toEqual({
      row: 4,
      col: 2,
    });
  });
});

describe('rangeFromAnchor', () => {
  it('returns a single-cell range when anchor equals active', () => {
    expect(rangeFromAnchor({ row: 2, col: 1 }, { row: 2, col: 1 })).toEqual({
      top: 2,
      left: 1,
      bottom: 2,
      right: 1,
    });
  });

  it('normalizes an inverted range', () => {
    expect(rangeFromAnchor({ row: 3, col: 2 }, { row: 1, col: 0 })).toEqual({
      top: 1,
      left: 0,
      bottom: 3,
      right: 2,
    });
  });

  it('treats a null anchor as the active cell', () => {
    expect(rangeFromAnchor(null, { row: 2, col: 1 })).toEqual({
      top: 2,
      left: 1,
      bottom: 2,
      right: 1,
    });
  });
});

describe('isWithinRange', () => {
  const range = { top: 1, left: 1, bottom: 3, right: 2 };
  it('detects cells inside the range', () => {
    expect(isWithinRange({ row: 2, col: 1 }, range)).toBe(true);
    expect(isWithinRange({ row: 1, col: 1 }, range)).toBe(true);
    expect(isWithinRange({ row: 3, col: 2 }, range)).toBe(true);
  });
  it('detects cells outside the range', () => {
    expect(isWithinRange({ row: 0, col: 1 }, range)).toBe(false);
    expect(isWithinRange({ row: 2, col: 0 }, range)).toBe(false);
  });
});

describe('isWithinBounds', () => {
  it('detects cells inside the grid dimensions', () => {
    expect(isWithinBounds({ row: 0, col: 0 }, DIMS)).toBe(true);
    expect(isWithinBounds({ row: 4, col: 2 }, DIMS)).toBe(true);
  });
  it('detects cells outside the grid dimensions', () => {
    expect(isWithinBounds({ row: -1, col: 0 }, DIMS)).toBe(false);
    expect(isWithinBounds({ row: 5, col: 0 }, DIMS)).toBe(false);
    expect(isWithinBounds({ row: 0, col: 3 }, DIMS)).toBe(false);
  });
});

describe('jumpToEdge', () => {
  // matrix: true = non-empty cell. Column 0 has a gap at row 2.
  const isEmpty = (row: number, col: number) => {
    const filled: Record<number, number[]> = {
      0: [0, 1, 3, 4],
      1: [0, 1, 2, 3, 4],
      2: [0, 1, 2, 3, 4],
    };
    return !filled[col]?.includes(row);
  };

  it('jumps from a filled cell to the last filled cell before a gap', () => {
    // Starting at row 0 col 0, moving down, next is filled (1), then row2 empty -> stop at row1
    expect(jumpToEdge({ row: 0, col: 0 }, 'down', DIMS, isEmpty)).toEqual({
      row: 1,
      col: 0,
    });
  });

  it('jumps to the end of the next block when the adjacent cell is filled', () => {
    // row2 col0 is empty, row3 filled -> Ctrl+Down traverses the filled
    // block (rows 3-4) to its far end at row4.
    expect(jumpToEdge({ row: 2, col: 0 }, 'down', DIMS, isEmpty)).toEqual({
      row: 4,
      col: 0,
    });
  });

  it('skips a run of empty cells to the next filled cell', () => {
    // col0 rows: filled,filled,empty,filled,filled. From row1 (filled) with
    // an empty neighbour below, Ctrl+Down skips the gap to the next filled (row3).
    expect(jumpToEdge({ row: 1, col: 0 }, 'down', DIMS, isEmpty)).toEqual({
      row: 3,
      col: 0,
    });
  });

  it('jumps to the grid edge when all cells ahead are filled', () => {
    expect(jumpToEdge({ row: 0, col: 1 }, 'down', DIMS, isEmpty)).toEqual({
      row: 4,
      col: 1,
    });
  });

  it('clamps at the boundary when already at the edge', () => {
    expect(jumpToEdge({ row: 0, col: 0 }, 'up', DIMS, isEmpty)).toEqual({
      row: 0,
      col: 0,
    });
  });
});

describe('pageDelta', () => {
  it('computes visible row count from container/row height', () => {
    expect(pageDelta(520, 52)).toBe(10);
  });
  it('never returns less than 1', () => {
    expect(pageDelta(10, 52)).toBe(1);
  });
});

describe('checkbox column offset helpers', () => {
  it('shifts data col to visible cell index when checkbox present', () => {
    expect(dataColToVisibleCellIndex(0, true)).toBe(1);
    expect(dataColToVisibleCellIndex(2, true)).toBe(3);
  });
  it('is identity when checkbox absent', () => {
    expect(dataColToVisibleCellIndex(0, false)).toBe(0);
    expect(dataColToVisibleCellIndex(2, false)).toBe(2);
  });
  it('round-trips visible cell index back to data col', () => {
    expect(visibleCellIndexToDataCol(1, true)).toBe(0);
    expect(visibleCellIndexToDataCol(2, false)).toBe(2);
  });
});
