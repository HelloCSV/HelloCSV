import {
  CsvDownloadMode,
  EnumLabelDict,
  ImporterOutputFieldType,
  SheetColumnReferenceDefinition,
  SheetDefinition,
  SheetRow,
  SheetState,
} from '../types';
import { DOWNLOADED_CSV_SEPARATOR } from '../constants';

export const isUndefinedOrNull = (a: any) => {
  return a === null || a === undefined;
};

export const isPresent = (a: any) => !isUndefinedOrNull(a);

export const filterEmptyRows = (state: SheetState) => {
  return state.rows.filter((d) => Object.keys(d).length > 0);
};

export function isEmptyCell(value: any): value is null | undefined {
  return isUndefinedOrNull(value) || value === '';
}

export const removeDuplicates = (array: any[]) => {
  return [...new Set(array)];
};

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

function escapeCsvCell(value: ImporterOutputFieldType): string {
  if (value == null) {
    return '';
  }

  let cell = String(value);

  cell = cell.replace(/"/g, '""');

  if (/[",\n\r]/.test(cell)) {
    cell = `"${cell}"`;
  }

  return cell;
}

export function generateCsvContent(
  sheetDefinition: SheetDefinition,
  data: SheetRow[],
  enumLabelDict: EnumLabelDict,
  csvDownloadMode: CsvDownloadMode
) {
  const headers = sheetDefinition.columns
    .map((column) =>
      escapeCsvCell(csvDownloadMode === 'label' ? column.label : column.id)
    )
    .join(DOWNLOADED_CSV_SEPARATOR);

  const rows = data.map((row) =>
    sheetDefinition.columns
      .map((column) => {
        const value = row[column.id];
        let processedValue: ImporterOutputFieldType;

        if (csvDownloadMode === 'value' || value == null) {
          processedValue = value;
        } else if (column.type === 'enum') {
          processedValue = getLabelDictValue(
            enumLabelDict[sheetDefinition.id][column.id],
            value
          );
        } else if (column.type === 'reference') {
          processedValue = getLabelDictValue(
            getLabelDict(column, enumLabelDict),
            value
          );
        } else {
          processedValue = value;
        }

        return escapeCsvCell(processedValue);
      })
      .join(DOWNLOADED_CSV_SEPARATOR)
  );

  const csv = [headers, ...rows].join('\n');
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
  if (typeof value !== 'string') {
    return value;
  }

  return labelDict[value] ?? value;
}
