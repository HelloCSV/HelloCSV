import { applyTransformations } from '../transformers';
import {
  CellChangedPayload,
  ImporterAction,
  ImporterMode,
  ImporterState,
  IndexDBConfig,
  SheetDefinition,
  SheetRow,
} from '../types';
import { getIndexedDBState, setIndexedDBState } from './storage';
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

function buildInitialState(
  sheetDefinitions: SheetDefinition[],
  indexDBConfig: IndexDBConfig = { enabled: false }
): ImporterState {
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
    indexDBConfig,
  };
}

async function buildState(
  sheetDefinitions: SheetDefinition[],
  indexDBConfig: IndexDBConfig = { enabled: false }
): Promise<ImporterState> {
  const defaultState = buildInitialState(sheetDefinitions, indexDBConfig);
  try {
    if (!indexDBConfig.enabled) return defaultState;

    return await buildStateWithIndexedDB(sheetDefinitions, indexDBConfig);
  } catch (_error) {
    return defaultState;
  }
}

async function buildStateWithIndexedDB(
  sheetDefinitions: SheetDefinition[],
  indexDBConfig: IndexDBConfig
): Promise<ImporterState> {
  const state = await getIndexedDBState(
    sheetDefinitions,
    indexDBConfig.customKey
  );

  if (state != null) {
    return state;
  }

  const newState = buildInitialState(sheetDefinitions, indexDBConfig);
  setIndexedDBState(newState, indexDBConfig.customKey);
  return newState;
}

const reducer = (
  state: ImporterState,
  action: ImporterAction
): ImporterState => {
  let newState = state;
  if (action.type === 'ENTER_DATA_MANUALLY') {
    const emptyData = state.sheetDefinitions.map((sheet) => ({
      sheetId: sheet.id,
      rows: Array.from(
        { length: action.payload.amountOfEmptyRowsToAdd },
        () => ({})
      ),
    }));
    newState = { ...newState, mode: 'preview', sheetData: emptyData };
  } else if (action.type === 'FILE_PARSED') {
    newState = {
      ...state,
      parsedFile: action.payload.parsed,
      fileData: action.payload.fileData,
      mode: 'mapping',
    };
  } else if (action.type === 'COLUMN_MAPPING_CHANGED') {
    newState = {
      ...state,
      columnMappings: action.payload.mappings,
    };
  } else if (action.type === 'DATA_MAPPED') {
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
  } else if (action.type === 'CELL_CHANGED') {
    const newData = state.sheetData.map((sheet) => {
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
      ...newState,
      sheetData: applyTransformations(state.sheetDefinitions, newData),
      validationErrors: applyValidations(state.sheetDefinitions, newData),
    };
  } else if (action.type === 'REMOVE_ROWS') {
    const newData = state.sheetData.map((sheet) => {
      if (sheet.sheetId === action.payload.sheetId) {
        return {
          ...sheet,
          rows: sheet.rows.filter((row) => !action.payload.rows.includes(row)),
        };
      }

      return sheet;
    });

    newState = {
      ...state,
      sheetData: newData,
      validationErrors: applyValidations(state.sheetDefinitions, newData),
    };
  } else if (action.type === 'ADD_EMPTY_ROW') {
    const newData = state.sheetData.map((data) => {
      if (data.sheetId !== state.currentSheetId) {
        return data;
      }

      return {
        ...data,
        rows: [...data.rows, {}],
      };
    });

    newState = {
      ...state,
      sheetData: newData,
    };
  } else if (action.type === 'SHEET_CHANGED') {
    newState = {
      ...state,
      currentSheetId: action.payload.sheetId,
    };
  } else if (action.type === 'PROGRESS') {
    newState = {
      ...state,
      importProgress: action.payload.progress,
    };
  } else if (action.type === 'COMPLETED') {
    newState = {
      ...state,
      mode: 'completed',
      importStatistics: action.payload.importStatistics,
    };
  } else if (
    ['FAILED', 'PREVIEW', 'MAPPING', 'SUBMIT', 'UPLOAD'].includes(action.type)
  ) {
    newState = {
      ...state,
      mode: action.type.toLowerCase() as ImporterMode,
    };
  } else if (action.type === 'RESET') {
    newState = buildInitialState(state.sheetDefinitions, state.indexDBConfig);
  } else if (action.type === 'SET_STATE') {
    newState = action.payload.state;
  }

  if (state.indexDBConfig?.enabled) {
    setIndexedDBState(newState, state.indexDBConfig.customKey);
  }

  return newState;
};

export { reducer, buildInitialState, buildState };
