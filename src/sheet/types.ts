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
  maxRows?: number;
}

export type SheetColumnDefinition =
  | SheetColumnStringDefinition
  | SheetColumnNumberDefinition
  | SheetColumnBooleanDefinition
  | SheetColumnReferenceDefinition
  | SheetColumnEnumDefinition
  | SheetColumnDateDefinition
  | SheetColumnDatetimeDefinition
  | SheetColumnTimeDefinition
  | SheetColumnCalculatedDefinition;

/** The three date-like column types, all sharing {@link SheetColumnDateTypeArguments}. */
export type DateColumnType = 'date' | 'datetime' | 'time';

/** Clock used by the time picker + default display of `datetime`/`time`. */
export type HourFormat = '12h' | '24h';

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

interface SheetColumnBooleanDefinition extends SheetColumnBaseDefinition {
  type: 'boolean';
  typeArguments?: {
    trueLabel?: string;
    falseLabel?: string;
    /** Raw strings that coerce to `true` (case-insensitive). Falls back to
     * the built-in defaults when omitted. The `trueLabel` always counts too. */
    trueValues?: string[];
    /** Raw strings that coerce to `false` (case-insensitive). Falls back to
     * the built-in defaults when omitted. The `falseLabel` always counts too. */
    falseValues?: string[];
  };
}

export interface SheetColumnReferenceDefinition
  extends SheetColumnBaseDefinition {
  type: 'reference';
  typeArguments: {
    sheetId: string;
    sheetColumnId: string;
  };
}

interface SheetColumnEnumSingleTypeArguments {
  values: SelectOption<string>[];
  multiple?: false;
}

interface SheetColumnEnumMultipleTypeArguments {
  values: SelectOption<string>[];
  multiple: true;
  delimiter?: string | RegExp;
}

type SheetColumnEnumTypeArguments =
  | SheetColumnEnumSingleTypeArguments
  | SheetColumnEnumMultipleTypeArguments;

export interface SheetColumnEnumDefinition extends SheetColumnBaseDefinition {
  type: 'enum';
  typeArguments: SheetColumnEnumTypeArguments;
}

interface SheetColumnDateBaseTypeArguments {
  outputFormat?: string;
  displayFormat?: string;
  min?: string;
  max?: string;
}

interface SheetColumnTimeTypeArguments
  extends SheetColumnDateBaseTypeArguments {
  showSeconds?: boolean;
  hourFormat?: HourFormat;
}

export type SheetColumnDateTypeArguments = SheetColumnTimeTypeArguments;

interface SheetColumnDateDefinition extends SheetColumnBaseDefinition {
  type: 'date';
  typeArguments?: SheetColumnDateBaseTypeArguments;
}

interface SheetColumnDatetimeDefinition extends SheetColumnBaseDefinition {
  type: 'datetime';
  typeArguments?: SheetColumnTimeTypeArguments;
}

interface SheetColumnTimeDefinition extends SheetColumnBaseDefinition {
  type: 'time';
  typeArguments?: SheetColumnTimeTypeArguments;
}

export type SheetColumnDateLikeDefinition =
  | SheetColumnDateDefinition
  | SheetColumnDatetimeDefinition
  | SheetColumnTimeDefinition;

export function isDateLikeColumn(
  column: SheetColumnDefinition
): column is SheetColumnDateLikeDefinition {
  return (
    column.type === 'date' ||
    column.type === 'datetime' ||
    column.type === 'time'
  );
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
