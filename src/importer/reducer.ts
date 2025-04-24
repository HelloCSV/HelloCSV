import { applyTransformations } from '../transformers';
import {
  CellChangedPayload,
  ImporterAction,
  ImporterState,
  SheetDefinition,
  SheetRow,
} from '../types';
import {
  getFromIndexedDB,
  setInIndexedDB,
  getStateKey,
} from '../utils/storage';
import { stripFunctions } from '../utils/indexDbHelpers';
import { applyValidations } from '../validators';

function recalculateCalculatedColumns(
  row: SheetRow,
  payload: CellChangedPayload,
  state: ImporterState
): SheetRow {
  const sheetDefinition = state.sheetDefinitions.find(
    (s) => s.id === payload.sheetId
  );

  if (sheetDefinition != null) {
    const calculatedColumns = sheetDefinition.columns.filter(
      (column) => column.type === 'calculated'
    );

    calculatedColumns.forEach((column) => {
      row[column.id] = column.typeArguments.getValue(row);
    });
  }

  return row;
}

export async function buildInitialStateWithIndexedDB(
  sheetDefinitions: SheetDefinition[]
): Promise<ImporterState> {
  const stateKey = getStateKey(sheetDefinitions);
  const state = await getFromIndexedDB(stateKey);
  if (state != null) {
    return state;
  }

  const newState = buildInitialState(sheetDefinitions);
  await setInIndexedDB(stateKey, stripFunctions(newState));
  return newState;
}

function buildInitialState(sheetDefinitions: SheetDefinition[]): ImporterState {
  return {
    sheetDefinitions,
    currentSheetId: sheetDefinitions[0].id,
    mode: 'upload',
    validationErrors: [],
    sheetData: sheetDefinitions.map((sheet) => ({
      sheetId: sheet.id,
      rows: [],
    })),
    importProgress: 0,
  };
}

const reducer = (
  state: ImporterState,
  action: ImporterAction
): ImporterState => {
  let newState = state;
  switch (action.type) {
    case 'ENTER_DATA_MANUALLY': {
      const emptyData = state.sheetDefinitions.map((sheet) => ({
        sheetId: sheet.id,
        rows: Array.from(
          { length: action.payload.amountOfEmptyRowsToAdd },
          () => ({})
        ),
      }));

      newState = { ...state, mode: 'preview', sheetData: emptyData };
      break;
    }
    case 'FILE_UPLOADED':
      newState = { ...state, rowFile: action.payload.file };
      break;
    case 'FILE_PARSED':
      newState = {
        ...state,
        parsedFile: action.payload.parsed,
        mode: 'mapping',
      };
      break;
    case 'UPLOAD':
      newState = { ...state, mode: 'upload' };
      break;
    case 'COLUMN_MAPPING_CHANGED': {
      newState = { ...state, columnMappings: action.payload.mappings };
      break;
    }
    case 'DATA_MAPPED': {
      newState = {
        ...state,
        sheetData: applyTransformations(
          state.sheetDefinitions,
          action.payload.mappedData
        ),
        mode: 'preview',
        validationErrors: applyValidations(
          state.sheetDefinitions,
          action.payload.mappedData
        ),
      };
      break;
    }
    case 'CELL_CHANGED': {
      const currentData = state.sheetData;

      const newData = currentData.map((sheet) => {
        if (sheet.sheetId === action.payload.sheetId) {
          const newRows = [...sheet.rows];

          newRows[action.payload.rowIndex] = recalculateCalculatedColumns(
            action.payload.value,
            action.payload,
            state
          );

          return { ...sheet, rows: newRows };
        } else {
          return sheet;
        }
      });

      newState = {
        ...state,
        sheetData: applyTransformations(state.sheetDefinitions, newData),
        validationErrors: applyValidations(state.sheetDefinitions, newData),
      };
      break;
    }

    case 'REMOVE_ROWS': {
      const newData = state.sheetData.map((sheet) => {
        if (sheet.sheetId === action.payload.sheetId) {
          return {
            ...sheet,
            rows: sheet.rows.filter(
              (row) => !action.payload.rows.includes(row)
            ),
          };
        }

        return sheet;
      });

      newState = {
        ...state,
        sheetData: newData,
        validationErrors: applyValidations(state.sheetDefinitions, newData),
      };
      break;
    }

    case 'ADD_EMPTY_ROW': {
      const newData = state.sheetData.map((data) => {
        if (data.sheetId !== state.currentSheetId) {
          return data;
        }

        return {
          ...data,
          rows: [...data.rows, {}],
        };
      });

      newState = { ...state, sheetData: newData };
      break;
    }

    case 'SHEET_CHANGED':
      newState = { ...state, currentSheetId: action.payload.sheetId };
      break;
    case 'SUBMIT':
      newState = { ...state, mode: 'submit' };
      break;
    case 'PROGRESS':
      newState = { ...state, importProgress: action.payload.progress };
      break;
    case 'COMPLETED':
      newState = {
        ...state,
        mode: 'completed',
        importStatistics: action.payload.importStatistics,
      };
      break;
    case 'FAILED':
      newState = { ...state, mode: 'failed' };
      break;
    case 'PREVIEW':
      newState = { ...state, mode: 'preview' };
      break;
    case 'MAPPING':
      newState = { ...state, mode: 'mapping' };
      break;
    case 'RESET':
      newState = buildInitialState(state.sheetDefinitions);
      break;
    default:
      break;
  }

  setInIndexedDB(
    getStateKey(state.sheetDefinitions),
    stripFunctions(newState)
  ).catch(console.error);

  return newState;
};

export { reducer, buildInitialState };
