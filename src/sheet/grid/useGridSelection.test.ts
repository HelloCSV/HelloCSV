// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/preact';
import { useGridSelection } from './useGridSelection';

const DIMS = { rowCount: 5, colCount: 3 };

describe('useGridSelection', () => {
  it('starts empty with no active cell and a null range', () => {
    const { result } = renderHook(() => useGridSelection());
    expect(result.current.state).toEqual({
      active: null,
      anchor: null,
      editing: null,
      editInitialValue: 'preserve',
    });
    expect(result.current.range).toBeNull();
  });

  it('setActive sets the active cell, clears the anchor, and yields a single-cell range', () => {
    const { result } = renderHook(() => useGridSelection());
    act(() => result.current.setActive({ row: 2, col: 1 }));

    expect(result.current.state.active).toEqual({ row: 2, col: 1 });
    expect(result.current.state.anchor).toBeNull();
    expect(result.current.range).toEqual({
      top: 2,
      left: 1,
      bottom: 2,
      right: 1,
    });
    expect(result.current.isActive({ row: 2, col: 1 })).toBe(true);
    expect(result.current.isActive({ row: 0, col: 0 })).toBe(false);
  });

  it('extendTo seeds the anchor from the active cell and grows the range', () => {
    const { result } = renderHook(() => useGridSelection());
    act(() => result.current.setActive({ row: 1, col: 0 }));
    act(() => result.current.extendTo({ row: 3, col: 2 }));

    expect(result.current.state.anchor).toEqual({ row: 1, col: 0 });
    expect(result.current.state.active).toEqual({ row: 3, col: 2 });
    expect(result.current.range).toEqual({
      top: 1,
      left: 0,
      bottom: 3,
      right: 2,
    });
    expect(result.current.isSelected({ row: 2, col: 1 })).toBe(true);
    expect(result.current.isSelected({ row: 4, col: 2 })).toBe(false);
  });

  it('selectAll spans the whole grid', () => {
    const { result } = renderHook(() => useGridSelection());
    act(() => result.current.selectAll(DIMS));

    expect(result.current.range).toEqual({
      top: 0,
      left: 0,
      bottom: 4,
      right: 2,
    });
  });

  it('startEdit marks a cell editing; cancel/stop clears it and resets the initial value', () => {
    const { result } = renderHook(() => useGridSelection());
    act(() => result.current.startEdit({ row: 2, col: 1 }, { char: 'x' }));

    expect(result.current.state.editing).toEqual({ row: 2, col: 1 });
    expect(result.current.state.editInitialValue).toEqual({ char: 'x' });
    expect(result.current.isEditing({ row: 2, col: 1 })).toBe(true);

    act(() => result.current.cancelEdit());
    expect(result.current.state.editing).toBeNull();
    expect(result.current.state.editInitialValue).toBe('preserve');
    // The cell stays active after leaving edit mode.
    expect(result.current.state.active).toEqual({ row: 2, col: 1 });
  });

  it('clampToBounds clamps active/anchor and drops out-of-bounds editing', () => {
    const { result } = renderHook(() => useGridSelection());
    act(() => result.current.setActive({ row: 4, col: 2 }));
    act(() => result.current.extendTo({ row: 4, col: 2 }));
    act(() => result.current.startEdit({ row: 4, col: 2 }, 'preserve'));

    act(() => result.current.clampToBounds({ rowCount: 2, colCount: 2 }));

    expect(result.current.state.active).toEqual({ row: 1, col: 1 });
    expect(result.current.state.editing).toBeNull();
  });

  it('reset returns to the initial state', () => {
    const { result } = renderHook(() => useGridSelection());
    act(() => result.current.setActive({ row: 2, col: 1 }));
    act(() => result.current.reset());

    expect(result.current.state.active).toBeNull();
    expect(result.current.range).toBeNull();
  });

  describe('drag selection', () => {
    it('ignores dragTo until a drag has begun', () => {
      const { result } = renderHook(() => useGridSelection());
      act(() => result.current.setActive({ row: 0, col: 0 }));
      // No beginDrag yet -> dragTo is a no-op, range stays single-cell.
      act(() => result.current.dragTo({ row: 2, col: 2 }));

      expect(result.current.range).toEqual({
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
      });
    });

    it('beginDrag + dragTo extends the range; endDrag stops further extension', () => {
      const { result } = renderHook(() => useGridSelection());
      act(() => result.current.beginDrag({ row: 0, col: 0 }));
      act(() => result.current.dragTo({ row: 2, col: 1 }));

      expect(result.current.range).toEqual({
        top: 0,
        left: 0,
        bottom: 2,
        right: 1,
      });

      act(() => result.current.endDrag());
      act(() => result.current.dragTo({ row: 4, col: 2 }));
      // After endDrag, dragTo no longer extends.
      expect(result.current.range).toEqual({
        top: 0,
        left: 0,
        bottom: 2,
        right: 1,
      });
    });
  });
});
