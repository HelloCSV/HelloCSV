import { DOWNLOADED_CSV_SEPARATOR } from '../constants';
import { SheetState, SheetRow, SheetDefinition } from '../types';

export function getTotalRows(sheetData: SheetState[]) {
  return sheetData.reduce((total, sheet) => total + sheet.rows.length, 0);
}

function getCsv(sheetRows: SheetRow[], sheetDefinition: SheetDefinition) {
  const headers = sheetDefinition.columns
    .map((column) => column.id)
    .join(DOWNLOADED_CSV_SEPARATOR);

  const rows = sheetRows.map((row) =>
    sheetDefinition.columns
      .map((column) => row[column.id])
      .join(DOWNLOADED_CSV_SEPARATOR)
  );

  const CsvContent = [headers, ...rows].join('\n');

  const blob = new Blob([CsvContent], { type: 'text/csv;charset=utf-8;' });
  return blob;
}

function exportCsv(
  sheetId: string,
  rows: SheetRow[],
  sheetDefinition: SheetDefinition
) {
  const blob = getCsv(rows, sheetDefinition);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${sheetId}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

export function exportAllCsvs(
  sheetData: SheetState[],
  sheetDefinitions: SheetDefinition[]
) {
  sheetData.forEach((sheet) => {
    exportCsv(
      sheet.sheetId,
      sheet.rows,
      sheetDefinitions.find((s) => s.id === sheet.sheetId)!
    );
  });
}

const getCsvSize = (rows: SheetRow[], sheetDefinition: SheetDefinition) => {
  const blob = getCsv(rows, sheetDefinition);

  return blob.size;
};

export const getDataSize = (
  sheetData: SheetState[],
  sheetDefinitions: SheetDefinition[]
) => {
  if (!sheetData.length) return 0;

  return sheetData.reduce((totalSize, sheet) => {
    if (sheet.rows.length > 0) {
      return (
        totalSize +
        getCsvSize(
          sheet.rows,
          sheetDefinitions.find((s) => s.id === sheet.sheetId)!
        )
      );
    }

    return totalSize;
  }, 0);
};
