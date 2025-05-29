import type { RowData } from '@tanstack/react-table';
import { ReactNode } from 'preact/compat';
import {
  ImporterOutputFieldType,
  ImporterTransformerDefinition,
  ImporterValidatorDefinition,
  SelectOption,
} from '../types';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface ColumnMeta<TData extends RowData, TValue> {
    columnLabel?: string;
  }
}

// --------- Sheet Definition Types ---------
export interface SheetDefinition {
  id: string;
  label: string;
  columns: SheetColumnDefinition[];
}

export type SheetColumnDefinition =
  | SheetColumnStringDefinition
  | SheetColumnNumberDefinition
  | SheetColumnReferenceDefinition
  | SheetColumnEnumDefinition
  | SheetColumnCalculatedDefinition;

interface SheetColumnBaseDefinition {
  id: string;
  label: string;
  suggestedMappingKeywords?: string[];
  isReadOnly?: boolean;
  validators?: ImporterValidatorDefinition[];
  transformers?: ImporterTransformerDefinition[];
  customRender?: (
    value: ImporterOutputFieldType,
    displayValue: ImporterOutputFieldType
  ) => ReactNode;
}

interface SheetColumnStringDefinition extends SheetColumnBaseDefinition {
  type: 'string';
}

interface SheetColumnNumberDefinition extends SheetColumnBaseDefinition {
  type: 'number';
  // TODO: Should we add precision here?
}

export interface SheetColumnReferenceDefinition
  extends SheetColumnBaseDefinition {
  type: 'reference';
  typeArguments: {
    sheetId: string;
    sheetColumnId: string;
  };
}

interface SheetColumnEnumDefinition extends SheetColumnBaseDefinition {
  type: 'enum';
  typeArguments: {
    values: SelectOption<string>[];
  };
}

interface SheetColumnCalculatedDefinition
  // Calculated columns are always readOnly
  extends Omit<SheetColumnBaseDefinition, 'isReadOnly'> {
  type: 'calculated';
  typeArguments: {
    getValue: (row: SheetRow) => ImporterOutputFieldType;
  };
}

export type EnumLabelDict = {
  [sheetId: string]: {
    [columnId: string]: {
      [value: string]: ImporterOutputFieldType;
    };
  };
};

// --------- Sheet State Types ---------
export type SheetRow = Record<string, ImporterOutputFieldType>;

export interface SheetState {
  sheetId: string;
  rows: SheetRow[]; // key being column id
}

export type SheetViewMode = 'all' | 'valid' | 'errors';
