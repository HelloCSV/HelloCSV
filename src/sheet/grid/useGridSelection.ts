import { useCallback, useMemo, useReducer, useRef } from 'preact/hooks';
import {
  CellCoord,
  CellRange,
  EditInitialValue,
  GridDimensions,
  GridSelectionState,
} from './gridTypes';
import { clampCoord, isWithinRange, rangeFromAnchor } from './coordinates';

type Action =
  | { type: 'setActive'; coord: CellCoord }
  | { type: 'extend'; coord: CellCoord }
  | { type: 'selectAll'; dims: GridDimensions }
  | { type: 'startEdit'; coord: CellCoord; initialValue: EditInitialValue }
  | { type: 'cancelEdit' }
  | { type: 'stopEditing' }
  | { type: 'clamp'; dims: GridDimensions }
  | { type: 'reset' };

const INITIAL: GridSelectionState = {
  active: null,
  anchor: null,
  editing: null,
  editInitialValue: 'preserve',
};

function reducer(
  state: GridSelectionState,
  action: Action
): GridSelectionState {
  switch (action.type) {
    case 'setActive':
      return {
        active: action.coord,
        anchor: null,
        editing: null,
        editInitialValue: 'preserve',
      };
    case 'extend':
      // Keep (or seed) the anchor at the current active cell, move active.
      return {
        ...state,
        anchor: state.anchor ?? state.active,
        active: action.coord,
        editing: null,
      };
    case 'selectAll':
      return {
        ...state,
        anchor: { row: 0, col: 0 },
        active: {
          row: Math.max(0, action.dims.rowCount - 1),
          col: Math.max(0, action.dims.colCount - 1),
        },
        editing: null,
      };
    case 'startEdit':
      return {
        ...state,
        active: action.coord,
        anchor: null,
        editing: action.coord,
        editInitialValue: action.initialValue,
      };
    case 'cancelEdit':
    case 'stopEditing':
      return { ...state, editing: null, editInitialValue: 'preserve' };
    case 'clamp': {
      if (!state.active) {
        return state;
      }

      const active = clampCoord(state.active, action.dims);
      const anchor = state.anchor
        ? clampCoord(state.anchor, action.dims)
        : null;

      // If editing coord fell out of bounds, stop editing.
      const editing =
        state.editing &&
        state.editing.row < action.dims.rowCount &&
        state.editing.col < action.dims.colCount
          ? state.editing
          : null;

      return { ...state, active, anchor, editing };
    }
    case 'reset':
      return INITIAL;
    default:
      return state;
  }
}

export interface GridSelection {
  state: GridSelectionState;
  /** Normalized rectangular selection, or null when nothing is active. */
  range: CellRange | null;
  setActive: (coord: CellCoord) => void;
  extendTo: (coord: CellCoord) => void;
  selectAll: (dims: GridDimensions) => void;
  startEdit: (coord: CellCoord, initialValue: EditInitialValue) => void;
  cancelEdit: () => void;
  stopEditing: () => void;
  clampToBounds: (dims: GridDimensions) => void;
  reset: () => void;
  /** Start a mouse drag-selection at a cell (sets it active, clears the range). */
  beginDrag: (coord: CellCoord) => void;
  /** Extend the drag-selection to a cell while the mouse button is held. */
  dragTo: (coord: CellCoord) => void;
  /** End the current mouse drag-selection. */
  endDrag: () => void;
  isActive: (coord: CellCoord) => boolean;
  isEditing: (coord: CellCoord) => boolean;
  isSelected: (coord: CellCoord) => boolean;
}

export function useGridSelection(): GridSelection {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const draggingRef = useRef(false);

  const range = useMemo(
    () => (state.active ? rangeFromAnchor(state.anchor, state.active) : null),
    [state.active, state.anchor]
  );

  const setActive = useCallback(
    (coord: CellCoord) => dispatch({ type: 'setActive', coord }),
    []
  );
  const extendTo = useCallback(
    (coord: CellCoord) => dispatch({ type: 'extend', coord }),
    []
  );
  const selectAll = useCallback(
    (dims: GridDimensions) => dispatch({ type: 'selectAll', dims }),
    []
  );
  const startEdit = useCallback(
    (coord: CellCoord, initialValue: EditInitialValue) =>
      dispatch({ type: 'startEdit', coord, initialValue }),
    []
  );
  const cancelEdit = useCallback(() => dispatch({ type: 'cancelEdit' }), []);
  const stopEditing = useCallback(() => dispatch({ type: 'stopEditing' }), []);
  const clampToBounds = useCallback(
    (dims: GridDimensions) => dispatch({ type: 'clamp', dims }),
    []
  );
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);

  const beginDrag = useCallback((coord: CellCoord) => {
    draggingRef.current = true;
    dispatch({ type: 'setActive', coord });
  }, []);
  const dragTo = useCallback((coord: CellCoord) => {
    if (draggingRef.current) dispatch({ type: 'extend', coord });
  }, []);
  const endDrag = useCallback(() => {
    draggingRef.current = false;
  }, []);

  const isActive = useCallback(
    (coord: CellCoord) =>
      state.active?.row === coord.row && state.active?.col === coord.col,
    [state.active]
  );
  const isEditing = useCallback(
    (coord: CellCoord) =>
      state.editing?.row === coord.row && state.editing?.col === coord.col,
    [state.editing]
  );
  const isSelected = useCallback(
    (coord: CellCoord) => (range ? isWithinRange(coord, range) : false),
    [range]
  );

  return {
    state,
    range,
    setActive,
    extendTo,
    selectAll,
    startEdit,
    cancelEdit,
    stopEditing,
    clampToBounds,
    reset,
    beginDrag,
    dragTo,
    endDrag,
    isActive,
    isEditing,
    isSelected,
  };
}
