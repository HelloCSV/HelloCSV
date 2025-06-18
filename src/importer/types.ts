import type {
  ThemeVariant,
  ImporterValidationError,
  ParsedFile,
  SheetDefinition,
  SheetState,
  MappedData,
  OnDataColumnsMappedCallback,
  ColumnMapping,
  SheetRow,
  ImportStatistics,
  CustomFileLoader,
  Translation,
} from '../types';

// --------- Importer Definition Types ---------

export interface ImporterDefinition {
  sheets: SheetDefinition[];
  translationResources?: Record<string, Translation>;
  theme?: ThemeVariant;
  // Called after the columns are mapped to sheet definitions by the user
  onDataColumnsMapped?: OnDataColumnsMappedCallback;
  customFileLoaders?: CustomFileLoader[];
  allowManualDataEntry?: boolean;
  onComplete: (
    state: ImporterState,
    onProgress: (progress: number) => void
  ) => Promise<void> | Promise<ImportStatistics>;
  locale?: string;
  preventUploadOnValidationErrors?:
    | boolean
    | ((errors: ImporterValidationError[]) => boolean);
  maxFileSizeInBytes?: number;
  onSummaryFinished?: () => void;
  customSuggestedMapper?: (
    sheetDefinitions: SheetDefinition[],
    csvHeaders: string[]
  ) => ColumnMapping[] | Promise<ColumnMapping[]>;
  persistenceConfig?: PersistenceConfig;
  csvDownloadMode?: CsvDownloadMode;
}

export type CsvDownloadMode = 'value' | 'label';

export interface PersistenceConfig {
  enabled: boolean;
  customKey?: string;
}

/**
 * mapping - user is mapping the columns from the file to the sheet columns
 * preview - user is reviewing the data to be imported or is imputing data manually
 * submit  - user is submitting the data - during/after the onComplete callback
 * completed - the import process is completed
 * failed - the import process failed
 */
export type ImporterMode =
  | 'upload'
  | 'mapping'
  | 'preview'
  | 'submit'
  | 'completed'
  | 'failed';

export interface ImporterState {
  sheetDefinitions: SheetDefinition[];
  currentSheetId: string;
  mode: ImporterMode;
  validationErrors: ImporterValidationError[];
  sheetData: SheetState[];
  parsedFile?: ParsedFile;
  rowFile?: File;
  columnMappings?: ColumnMapping[];
  importProgress: number;
  importStatistics?: ImportStatistics;
}

export type ImporterOutputFieldType = string | number | undefined;

export interface CellChangedPayload {
  sheetId: string;
  rowIndex: number;
  value: SheetRow;
}

export interface RemoveRowsPayload {
  sheetId: string;
  rows: SheetRow[];
}

export type ImporterAction =
  | {
      type: 'ENTER_DATA_MANUALLY';
      payload: {
        amountOfEmptyRowsToAdd: number;
      };
    } // Changes the mode to 'preview'
  | {
      type: 'FILE_PARSED';
      payload: { parsed: ParsedFile; rowFile: File };
    } // Sets the parsed file and changes the mode to 'mapping'
  | { type: 'UPLOAD' } // Changes the mode to 'upload' - used when going back from in the mapping screen
  | { type: 'COLUMN_MAPPING_CHANGED'; payload: { mappings: ColumnMapping[] } } // Sets the proper mappings
  | { type: 'DATA_MAPPED'; payload: { mappedData: MappedData } } // Sets mapped data as sheetData, optionally runs onDataColumnsMapped callback calls validations, changes the mode to 'preview'
  | {
      type: 'CELL_CHANGED';
      payload: CellChangedPayload;
    } // Searches for the cell and changes the value, calls validations
  | {
      type: 'REMOVE_ROWS';
      payload: RemoveRowsPayload;
    } // Removes rows from the sheetData
  | {
      type: 'ADD_EMPTY_ROW';
    } // Removes rows from the sheetData
  | { type: 'SHEET_CHANGED'; payload: { sheetId: string } } // Calls onComplete callback with state.sheetData, changes mode to 'submit'
  | { type: 'SUBMIT' } // Calls onComplete callback with state.sheetData, changes mode to 'submit'
  | { type: 'PROGRESS'; payload: { progress: number } } // Updates importProgress
  | { type: 'COMPLETED'; payload: { importStatistics?: ImportStatistics } } // Changes the mode to 'completed'
  | { type: 'FAILED' } // Changes the mode to 'failed' when importing failed
  | { type: 'PREVIEW' } // Changes the mode to 'preview' - used when uploading failed and user wants to retry
  | { type: 'MAPPING' } // Changes the mode to 'mapping' - used to go back to mappings screen in case there were some mapping issues
  | { type: 'RESET' } // Resets the state to the initial state
  | { type: 'SET_STATE'; payload: { state: ImporterState } }; // Fetches the state from the indexedDB

type WithRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type ImporterDefinitionWithDefaults = WithRequired<
  ImporterDefinition,
  | 'maxFileSizeInBytes'
  | 'persistenceConfig'
  | 'csvDownloadMode'
  | 'allowManualDataEntry' // List of optional fields that need default value
>;
