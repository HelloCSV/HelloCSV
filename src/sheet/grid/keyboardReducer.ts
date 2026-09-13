import {
  GridAction,
  GridDimensions,
  GridSelectionState,
  KeyDescriptor,
  MoveDirection,
} from './gridTypes';
import { clampCoord, moveCoord } from './coordinates';

function isPrintableChar(descriptor: KeyDescriptor): boolean {
  return (
    descriptor.key.length === 1 &&
    !descriptor.ctrlKey &&
    !descriptor.metaKey &&
    !descriptor.altKey
  );
}

/** Ctrl (Win/Linux) or Cmd (macOS) — the primary shortcut modifier. */
function hasCmdModifier(descriptor: KeyDescriptor): boolean {
  return descriptor.ctrlKey || descriptor.metaKey;
}

const ARROW_DIRECTIONS: Record<string, MoveDirection> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

/**
 * Resolve a key press into a grid action. Pure and DOM-free so every shortcut
 * can be unit-tested. `isEditable(active)` reports whether the active cell
 * accepts edits (false for read-only cells / when editing is disabled).
 *
 * Coordinates returned in Move/Extend actions are already clamped to bounds.
 */
export function resolveKeyAction(
  descriptor: KeyDescriptor,
  state: GridSelectionState,
  dims: GridDimensions,
  isEditable: (active: GridSelectionState['active']) => boolean
): GridAction {
  // Undo/redo are global to the grid: they work with no active cell and even
  // when every row was just deleted (empty grid), so they're resolved before the
  // guards below. While editing a cell we defer to the input's native text undo.
  if (!state.editing && hasCmdModifier(descriptor)) {
    const key = descriptor.key.toLowerCase();
    if (key === 'z') {
      return descriptor.shiftKey ? { type: 'Redo' } : { type: 'Undo' };
    }
    if (key === 'y') {
      return { type: 'Redo' };
    }
  }

  if (dims.rowCount === 0 || dims.colCount === 0) {
    return { type: 'NoOp' };
  }

  // ---- While editing, only commit/cancel keys are handled here; every other
  // key belongs to the active input/combobox. ----
  if (state.editing) {
    switch (descriptor.key) {
      case 'Escape':
        return { type: 'CancelEdit' };
      case 'Enter':
        return {
          type: 'CommitAndMove',
          direction: descriptor.shiftKey ? 'up' : 'down',
        };
      case 'Tab':
        return {
          type: 'CommitAndMove',
          direction: descriptor.shiftKey ? 'left' : 'right',
        };
      default:
        return { type: 'NoOp' };
    }
  }

  // No active cell yet: any navigation key seeds it at the origin.
  const active = state.active;
  if (!active) {
    if (ARROW_DIRECTIONS[descriptor.key] || descriptor.key === 'Tab') {
      return { type: 'MoveActive', to: clampCoord({ row: 0, col: 0 }, dims) };
    }
    return { type: 'NoOp' };
  }

  const editable = isEditable(active);

  // ---- Command shortcuts (Ctrl/Cmd + key) ----
  if (hasCmdModifier(descriptor)) {
    const arrowDir = ARROW_DIRECTIONS[descriptor.key];
    if (arrowDir) {
      return { type: 'JumpEdge', direction: arrowDir };
    }
    switch (descriptor.key.toLowerCase()) {
      case 'a':
        return { type: 'SelectAll' };
      case 'c':
        return { type: 'Copy' };
      case 'x':
        return { type: 'Cut' };
      case 'v':
        return { type: 'Paste' };
      case 'd':
        return { type: 'FillDown' };
      case 'home':
        return { type: 'MoveActive', to: clampCoord({ row: 0, col: 0 }, dims) };
      case 'end':
        return {
          type: 'MoveActive',
          to: clampCoord(
            { row: dims.rowCount - 1, col: dims.colCount - 1 },
            dims
          ),
        };
    }
    // Ctrl+Home / Ctrl+End arrive with key 'Home'/'End' (not lowercased match above).
    if (descriptor.key === 'Home') {
      return { type: 'MoveActive', to: clampCoord({ row: 0, col: 0 }, dims) };
    }
    if (descriptor.key === 'End') {
      return {
        type: 'MoveActive',
        to: clampCoord(
          { row: dims.rowCount - 1, col: dims.colCount - 1 },
          dims
        ),
      };
    }
    return { type: 'NoOp' };
  }

  // ---- Navigation and editing (no command modifier) ----
  const arrowDir = ARROW_DIRECTIONS[descriptor.key];
  if (arrowDir) {
    const to = moveCoord(active, arrowDir, dims);
    return descriptor.shiftKey
      ? { type: 'ExtendSelection', to }
      : { type: 'MoveActive', to };
  }

  switch (descriptor.key) {
    case 'Tab':
      return {
        type: 'MoveActive',
        to: moveCoord(active, descriptor.shiftKey ? 'left' : 'right', dims),
      };
    case 'Enter':
      return {
        type: 'MoveActive',
        to: moveCoord(active, descriptor.shiftKey ? 'up' : 'down', dims),
      };
    case 'F2':
      return editable
        ? { type: 'StartEdit', initialValue: 'preserve' }
        : { type: 'NoOp' };
    case 'Delete':
    case 'Backspace':
      return editable ? { type: 'ClearCells' } : { type: 'NoOp' };
    case 'Home':
      return {
        type: 'MoveActive',
        to: clampCoord({ row: active.row, col: 0 }, dims),
      };
    case 'End':
      return {
        type: 'MoveActive',
        to: clampCoord({ row: active.row, col: dims.colCount - 1 }, dims),
      };
    case 'PageUp':
    case 'PageDown':
      // Page distance depends on the viewport; the caller resolves it via
      // JumpEdge-like handling. Signalled here as a directional jump.
      return { type: 'NoOp' };
    case 'Escape':
      return { type: 'NoOp' };
  }

  if (isPrintableChar(descriptor)) {
    return editable
      ? { type: 'StartEdit', initialValue: { char: descriptor.key } }
      : { type: 'NoOp' };
  }

  return { type: 'NoOp' };
}
