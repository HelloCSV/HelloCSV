import {
  CsvDownloadMode,
  EnumLabelDict,
  ImporterOutputFieldType,
  SheetColumnDefinition,
  SheetColumnReferenceDefinition,
  SheetDefinition,
  SheetRow,
  SheetState,
} from '../types';
import {
  DEFAULT_BOOLEAN_FALSE_LABEL,
  DEFAULT_BOOLEAN_TRUE_LABEL,
  DOWNLOADED_CSV_SEPARATOR,
} from '../constants';
import { applyTransformations } from '@/transformers';

export const isUndefinedOrNull = (a: any) => {
  return a === null || a === undefined;
};

export const isPresent = (a: any) => !isUndefinedOrNull(a);

export const filterEmptyRows = (state: SheetState) => {
  return state.rows.filter((d) => Object.keys(d).length > 0);
};

export function isEmptyCell(value: any): boolean {
  if (isUndefinedOrNull(value)) {
    return true;
  }
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return false;
}

export const removeDuplicates = (array: any[]) => {
  return [...new Set(array)];
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function normalizeValue(value: ImporterOutputFieldType) {
  if (value == null) {
    return null;
  }

  const charsToRemove = ['_', ' ', '.', '-', '/'];
  return value
    .toString()
    .toLowerCase()
    .replace(
      new RegExp(charsToRemove.map((char) => `\\${char}`).join('|'), 'g'),
      ''
    );
}

export function escapeDelimitedCell(
  value: ImporterOutputFieldType,
  delimiter: string
): string {
  if (value == null) {
    return '';
  }

  let cell = String(value);

  cell = cell.replace(/"/g, '""');

  if (cell.includes('"') || cell.includes(delimiter) || /[\n\r]/.test(cell)) {
    cell = `"${cell}"`;
  }

  return cell;
}

export function serializeRows(
  rows: ImporterOutputFieldType[][],
  delimiter: string
): string {
  return rows
    .map((row) =>
      row.map((cell) => escapeDelimitedCell(cell, delimiter)).join(delimiter)
    )
    .join('\n');
}

export function generateCsvContent(
  sheetDefinition: SheetDefinition,
  data: SheetRow[],
  enumLabelDict: EnumLabelDict,
  csvDownloadMode: CsvDownloadMode
) {
  const headerRow = sheetDefinition.columns.map((column) =>
    csvDownloadMode === 'label' ? column.label : column.id
  );

  const dataRows = data.map((row) =>
    sheetDefinition.columns.map((column) => {
      const value = row[column.id];

      if (csvDownloadMode === 'value' || value == null) {
        return Array.isArray(value) ? value.join(', ') : value;
      }

      return getColumnDisplayValue(
        sheetDefinition,
        column,
        value,
        enumLabelDict
      );
    })
  );

  const csv = serializeRows([headerRow, ...dataRows], DOWNLOADED_CSV_SEPARATOR);
  return new Blob([csv], { type: 'text/csv' });
}

export function downloadSheetAsCsv(
  sheetDefinition: SheetDefinition,
  data: SheetRow[],
  enumLabelDict: EnumLabelDict,
  csvDownloadMode: CsvDownloadMode
) {
  const blob = generateCsvContent(
    sheetDefinition,
    data,
    enumLabelDict,
    csvDownloadMode
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sheetDefinition.label}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function getLabelDict(
  columnDefinition: SheetColumnReferenceDefinition,
  enumLabelDict: EnumLabelDict
) {
  const { sheetId, sheetColumnId } = columnDefinition.typeArguments;

  return enumLabelDict[sheetId][sheetColumnId] ?? {};
}

export function getLabelDictValue(
  labelDict: Record<string, ImporterOutputFieldType>,
  value: ImporterOutputFieldType
): ImporterOutputFieldType {
  if (Array.isArray(value)) {
    return value.map((v) => labelDict[v] ?? v).join(', ');
  }

  if (typeof value !== 'string') {
    return value;
  }

  return labelDict[value] ?? value;
}

export function getColumnDisplayValue(
  sheetDefinition: SheetDefinition,
  columnDefinition: SheetColumnDefinition,
  value: ImporterOutputFieldType,
  enumLabelDict: EnumLabelDict
): ImporterOutputFieldType {
  if (columnDefinition.type === 'enum') {
    return getLabelDictValue(
      enumLabelDict[sheetDefinition.id]?.[columnDefinition.id] ?? {},
      value
    );
  }

  if (columnDefinition.type === 'reference' && value != null) {
    return getLabelDictValue(
      getLabelDict(columnDefinition, enumLabelDict),
      value
    );
  }

  if (columnDefinition.type === 'boolean') {
    if (value === true) {
      return (
        columnDefinition.typeArguments?.trueLabel ?? DEFAULT_BOOLEAN_TRUE_LABEL
      );
    }
    if (value === false) {
      return (
        columnDefinition.typeArguments?.falseLabel ??
        DEFAULT_BOOLEAN_FALSE_LABEL
      );
    }
  }

  return value;
}

export function getSubmittedSheetData(
  sheets: SheetDefinition[],
  sheetData: SheetState[]
) {
  return applyTransformations(
    sheets,
    sheetData.map((d) => ({ ...d, rows: filterEmptyRows(d) }))
  );
}
