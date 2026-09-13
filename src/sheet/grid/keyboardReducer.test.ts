import { describe, it, expect } from 'vitest';
import { resolveKeyAction } from './keyboardReducer';
import { GridSelectionState, KeyDescriptor } from './gridTypes';

const DIMS = { rowCount: 5, colCount: 3 };

const base: GridSelectionState = {
  active: { row: 2, col: 1 },
  anchor: null,
  editing: null,
  editInitialValue: 'preserve',
};

function key(k: string, mods: Partial<KeyDescriptor> = {}): KeyDescriptor {
  return {
    key: k,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    ...mods,
  };
}

const alwaysEditable = () => true;

describe('resolveKeyAction — not editing', () => {
  it('arrow keys move the active cell', () => {
    expect(
      resolveKeyAction(key('ArrowDown'), base, DIMS, alwaysEditable)
    ).toEqual({ type: 'MoveActive', to: { row: 3, col: 1 } });
    expect(
      resolveKeyAction(key('ArrowUp'), base, DIMS, alwaysEditable)
    ).toEqual({
      type: 'MoveActive',
      to: { row: 1, col: 1 },
    });
    expect(
      resolveKeyAction(key('ArrowLeft'), base, DIMS, alwaysEditable)
    ).toEqual({ type: 'MoveActive', to: { row: 2, col: 0 } });
    expect(
      resolveKeyAction(key('ArrowRight'), base, DIMS, alwaysEditable)
    ).toEqual({ type: 'MoveActive', to: { row: 2, col: 2 } });
  });

  it('shift+arrow extends the selection', () => {
    expect(
      resolveKeyAction(
        key('ArrowDown', { shiftKey: true }),
        base,
        DIMS,
        alwaysEditable
      )
    ).toEqual({ type: 'ExtendSelection', to: { row: 3, col: 1 } });
  });

  it('ctrl/cmd+arrow jumps to an edge', () => {
    expect(
      resolveKeyAction(
        key('ArrowDown', { ctrlKey: true }),
        base,
        DIMS,
        alwaysEditable
      )
    ).toEqual({ type: 'JumpEdge', direction: 'down' });
    expect(
      resolveKeyAction(
        key('ArrowRight', { metaKey: true }),
        base,
        DIMS,
        alwaysEditable
      )
    ).toEqual({ type: 'JumpEdge', direction: 'right' });
  });

  it('Tab / Shift+Tab move horizontally', () => {
    expect(resolveKeyAction(key('Tab'), base, DIMS, alwaysEditable)).toEqual({
      type: 'MoveActive',
      to: { row: 2, col: 2 },
    });
    expect(
      resolveKeyAction(
        key('Tab', { shiftKey: true }),
        base,
        DIMS,
        alwaysEditable
      )
    ).toEqual({ type: 'MoveActive', to: { row: 2, col: 0 } });
  });

  it('Enter / Shift+Enter move vertically', () => {
    expect(resolveKeyAction(key('Enter'), base, DIMS, alwaysEditable)).toEqual({
      type: 'MoveActive',
      to: { row: 3, col: 1 },
    });
    expect(
      resolveKeyAction(
        key('Enter', { shiftKey: true }),
        base,
        DIMS,
        alwaysEditable
      )
    ).toEqual({ type: 'MoveActive', to: { row: 1, col: 1 } });
  });

  it('F2 starts editing preserving the value', () => {
    expect(resolveKeyAction(key('F2'), base, DIMS, alwaysEditable)).toEqual({
      type: 'StartEdit',
      initialValue: 'preserve',
    });
  });

  it('a printable character starts type-to-edit', () => {
    expect(resolveKeyAction(key('a'), base, DIMS, alwaysEditable)).toEqual({
      type: 'StartEdit',
      initialValue: { char: 'a' },
    });
    expect(resolveKeyAction(key('5'), base, DIMS, alwaysEditable)).toEqual({
      type: 'StartEdit',
      initialValue: { char: '5' },
    });
  });

  it('type-to-edit is suppressed on a read-only cell', () => {
    expect(resolveKeyAction(key('a'), base, DIMS, () => false)).toEqual({
      type: 'NoOp',
    });
    // F2 also suppressed when not editable
    expect(resolveKeyAction(key('F2'), base, DIMS, () => false)).toEqual({
      type: 'NoOp',
    });
  });

  it('Delete / Backspace clear cells', () => {
    expect(resolveKeyAction(key('Delete'), base, DIMS, alwaysEditable)).toEqual(
      {
        type: 'ClearCells',
      }
    );
    expect(
      resolveKeyAction(key('Backspace'), base, DIMS, alwaysEditable)
    ).toEqual({ type: 'ClearCells' });
  });

  it('does not clear read-only cells', () => {
    expect(resolveKeyAction(key('Delete'), base, DIMS, () => false)).toEqual({
      type: 'NoOp',
    });
  });

  it('Ctrl/Cmd+A selects all', () => {
    expect(
      resolveKeyAction(key('a', { ctrlKey: true }), base, DIMS, alwaysEditable)
    ).toEqual({ type: 'SelectAll' });
    expect(
      resolveKeyAction(key('a', { metaKey: true }), base, DIMS, alwaysEditable)
    ).toEqual({ type: 'SelectAll' });
  });

  it('Ctrl/Cmd+C/X/V/D map to clipboard actions', () => {
    expect(
      resolveKeyAction(key('c', { metaKey: true }), base, DIMS, alwaysEditable)
    ).toEqual({ type: 'Copy' });
    expect(
      resolveKeyAction(key('x', { metaKey: true }), base, DIMS, alwaysEditable)
    ).toEqual({ type: 'Cut' });
    expect(
      resolveKeyAction(key('v', { metaKey: true }), base, DIMS, alwaysEditable)
    ).toEqual({ type: 'Paste' });
    expect(
      resolveKeyAction(key('d', { metaKey: true }), base, DIMS, alwaysEditable)
    ).toEqual({ type: 'FillDown' });
  });

  it('Home/End/Ctrl+Home/PageDown jump', () => {
    expect(resolveKeyAction(key('Home'), base, DIMS, alwaysEditable)).toEqual({
      type: 'MoveActive',
      to: { row: 2, col: 0 },
    });
    expect(resolveKeyAction(key('End'), base, DIMS, alwaysEditable)).toEqual({
      type: 'MoveActive',
      to: { row: 2, col: 2 },
    });
    expect(
      resolveKeyAction(
        key('Home', { ctrlKey: true }),
        base,
        DIMS,
        alwaysEditable
      )
    ).toEqual({ type: 'MoveActive', to: { row: 0, col: 0 } });
    expect(
      resolveKeyAction(
        key('End', { ctrlKey: true }),
        base,
        DIMS,
        alwaysEditable
      )
    ).toEqual({ type: 'MoveActive', to: { row: 4, col: 2 } });
  });

  it('cut/copy are unaffected by read-only (selection may include readable cells)', () => {
    expect(
      resolveKeyAction(key('c', { ctrlKey: true }), base, DIMS, () => false)
    ).toEqual({ type: 'Copy' });
  });

  it('returns NoOp for unhandled keys', () => {
    expect(resolveKeyAction(key('F5'), base, DIMS, alwaysEditable)).toEqual({
      type: 'NoOp',
    });
  });
});

describe('resolveKeyAction — editing', () => {
  const editing: GridSelectionState = {
    ...base,
    editing: { row: 2, col: 1 },
  };

  it('Escape cancels the edit', () => {
    expect(
      resolveKeyAction(key('Escape'), editing, DIMS, alwaysEditable)
    ).toEqual({ type: 'CancelEdit' });
  });

  it('Enter commits and moves down', () => {
    expect(
      resolveKeyAction(key('Enter'), editing, DIMS, alwaysEditable)
    ).toEqual({ type: 'CommitAndMove', direction: 'down' });
    expect(
      resolveKeyAction(
        key('Enter', { shiftKey: true }),
        editing,
        DIMS,
        alwaysEditable
      )
    ).toEqual({ type: 'CommitAndMove', direction: 'up' });
  });

  it('Tab commits and moves horizontally', () => {
    expect(resolveKeyAction(key('Tab'), editing, DIMS, alwaysEditable)).toEqual(
      {
        type: 'CommitAndMove',
        direction: 'right',
      }
    );
    expect(
      resolveKeyAction(
        key('Tab', { shiftKey: true }),
        editing,
        DIMS,
        alwaysEditable
      )
    ).toEqual({ type: 'CommitAndMove', direction: 'left' });
  });

  it('other keys are NoOp while editing (handled by the input)', () => {
    expect(resolveKeyAction(key('a'), editing, DIMS, alwaysEditable)).toEqual({
      type: 'NoOp',
    });
    expect(
      resolveKeyAction(key('ArrowDown'), editing, DIMS, alwaysEditable)
    ).toEqual({ type: 'NoOp' });
  });
});

describe('resolveKeyAction — no active cell', () => {
  const empty: GridSelectionState = {
    active: null,
    anchor: null,
    editing: null,
    editInitialValue: 'preserve',
  };
  it('an arrow key seeds the active cell at the origin', () => {
    expect(
      resolveKeyAction(key('ArrowDown'), empty, DIMS, alwaysEditable)
    ).toEqual({ type: 'MoveActive', to: { row: 0, col: 0 } });
  });

  it('ctrl/cmd+z still resolves to Undo with no active cell', () => {
    expect(
      resolveKeyAction(key('z', { ctrlKey: true }), empty, DIMS, alwaysEditable)
    ).toEqual({ type: 'Undo' });
  });
});

describe('resolveKeyAction — undo/redo', () => {
  it('ctrl+z and cmd+z resolve to Undo', () => {
    expect(
      resolveKeyAction(key('z', { ctrlKey: true }), base, DIMS, alwaysEditable)
    ).toEqual({ type: 'Undo' });
    expect(
      resolveKeyAction(key('z', { metaKey: true }), base, DIMS, alwaysEditable)
    ).toEqual({ type: 'Undo' });
  });

  it('ctrl/cmd+shift+z resolves to Redo', () => {
    expect(
      resolveKeyAction(
        key('z', { ctrlKey: true, shiftKey: true }),
        base,
        DIMS,
        alwaysEditable
      )
    ).toEqual({ type: 'Redo' });
    // Some platforms deliver shift+z as an uppercase key.
    expect(
      resolveKeyAction(
        key('Z', { metaKey: true, shiftKey: true }),
        base,
        DIMS,
        alwaysEditable
      )
    ).toEqual({ type: 'Redo' });
  });

  it('ctrl/cmd+y resolves to Redo', () => {
    expect(
      resolveKeyAction(key('y', { ctrlKey: true }), base, DIMS, alwaysEditable)
    ).toEqual({ type: 'Redo' });
  });

  it('undo works even when the grid is empty', () => {
    expect(
      resolveKeyAction(
        key('z', { ctrlKey: true }),
        base,
        { rowCount: 0, colCount: 0 },
        alwaysEditable
      )
    ).toEqual({ type: 'Undo' });
  });

  it('defers to native text undo while editing a cell', () => {
    const editing: GridSelectionState = {
      ...base,
      editing: { row: 2, col: 1 },
    };
    expect(
      resolveKeyAction(
        key('z', { ctrlKey: true }),
        editing,
        DIMS,
        alwaysEditable
      )
    ).toEqual({ type: 'NoOp' });
  });
});
