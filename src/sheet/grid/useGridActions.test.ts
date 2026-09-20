// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/preact';
import { useGridActions } from './useGridActions';
import { SheetDefinition, SheetRow, SheetState } from '@/types';

const sheetDefinition = {
  id: 'people',
  label: 'People',
  columns: [
    { id: 'name', label: 'Name', type: 'string' },
    { id: 'age', label: 'Age', type: 'number' },
  ],
} as SheetDefinition;

function setup(
  opts: {
    canEditRows?: boolean;
    undo?: () => void;
    redo?: () => void;
  } = {}
) {
  // findRowIndex resolves rows by reference, so allData must share the objects.
  const rows: SheetRow[] = [
    { name: 'Ann', age: '30' },
    { name: 'Bob', age: '25' },
  ];
  const data: SheetState = { sheetId: 'people', rows };
  const allData: SheetState[] = [data];
  const setRowsData = vi.fn();

  const { result } = renderHook(() =>
    useGridActions({
      sheetDefinition,
      data,
      rowData: rows,
      allData,
      canEditRows: opts.canEditRows ?? true,
      setRowsData,
      undo: opts.undo,
      redo: opts.redo,
    })
  );

  return { result, setRowsData, rows };
}

const key = (init: KeyboardEventInit) => new KeyboardEvent('keydown', init);
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('useGridActions', () => {
  it('exposes grid dimensions derived from rowData and columns', () => {
    const { result } = setup();
    expect(result.current.dims).toEqual({ rowCount: 2, colCount: 2 });
  });

  it('ArrowDown moves the active cell', () => {
    const { result } = setup();
    act(() => result.current.selection.setActive({ row: 0, col: 0 }));
    act(() => result.current.handleGridKeyDown(key({ key: 'ArrowDown' })));
    expect(result.current.selection.state.active).toEqual({ row: 1, col: 0 });
  });

  it('Ctrl+A selects the whole grid', () => {
    const { result } = setup();
    act(() => result.current.selection.setActive({ row: 0, col: 0 }));
    act(() =>
      result.current.handleGridKeyDown(key({ key: 'a', ctrlKey: true }))
    );
    expect(result.current.selection.range).toEqual({
      top: 0,
      left: 0,
      bottom: 1,
      right: 1,
    });
  });

  it('Delete clears the selected cell and dispatches the emptied row', () => {
    const { result, setRowsData } = setup();
    act(() => result.current.selection.setActive({ row: 0, col: 0 }));
    act(() => result.current.handleGridKeyDown(key({ key: 'Delete' })));
    expect(setRowsData).toHaveBeenCalledWith([
      { sheetId: 'people', rowIndex: 0, value: { name: '', age: '30' } },
    ]);
  });

  it('does not clear cells when editing is disabled', () => {
    const { result, setRowsData } = setup({ canEditRows: false });
    act(() => result.current.selection.setActive({ row: 0, col: 0 }));
    act(() => result.current.handleGridKeyDown(key({ key: 'Delete' })));
    expect(setRowsData).not.toHaveBeenCalled();
  });

  it('Ctrl+D fills the top cell value down the selected range', () => {
    const { result, setRowsData } = setup();
    act(() => result.current.selection.setActive({ row: 0, col: 0 }));
    act(() =>
      result.current.handleGridKeyDown(
        key({ key: 'ArrowDown', shiftKey: true })
      )
    );
    act(() =>
      result.current.handleGridKeyDown(key({ key: 'd', ctrlKey: true }))
    );
    expect(setRowsData).toHaveBeenCalledWith([
      { sheetId: 'people', rowIndex: 1, value: { name: 'Ann', age: '25' } },
    ]);
  });

  it('copies a cell and pastes it into another', async () => {
    const { result, setRowsData } = setup();
    act(() => result.current.selection.setActive({ row: 0, col: 0 })); // 'Ann'
    act(() =>
      result.current.handleGridKeyDown(key({ key: 'c', ctrlKey: true }))
    );

    act(() => result.current.selection.setActive({ row: 1, col: 0 })); // 'Bob'
    await act(async () => {
      result.current.handleGridKeyDown(key({ key: 'v', ctrlKey: true }));
      await flush();
    });

    expect(setRowsData).toHaveBeenCalledWith([
      { sheetId: 'people', rowIndex: 1, value: { name: 'Ann', age: '25' } },
    ]);
  });

  it('Ctrl+Z invokes the undo callback when enabled', () => {
    const undo = vi.fn();
    const { result } = setup({ undo });
    act(() => result.current.selection.setActive({ row: 0, col: 0 }));
    act(() =>
      result.current.handleGridKeyDown(key({ key: 'z', ctrlKey: true }))
    );
    expect(undo).toHaveBeenCalledTimes(1);
  });

  it('Ctrl+Shift+Z and Ctrl+Y invoke the redo callback when enabled', () => {
    const redo = vi.fn();
    const { result } = setup({ redo });
    act(() => result.current.selection.setActive({ row: 0, col: 0 }));
    act(() =>
      result.current.handleGridKeyDown(
        key({ key: 'z', ctrlKey: true, shiftKey: true })
      )
    );
    act(() =>
      result.current.handleGridKeyDown(key({ key: 'y', ctrlKey: true }))
    );
    expect(redo).toHaveBeenCalledTimes(2);
  });

  it('does nothing on Ctrl+Z when undo/redo is disabled (no callbacks)', () => {
    const { result } = setup();
    act(() => result.current.selection.setActive({ row: 0, col: 0 }));
    // Should not throw when the callback is undefined.
    act(() =>
      result.current.handleGridKeyDown(key({ key: 'z', ctrlKey: true }))
    );
  });
});
