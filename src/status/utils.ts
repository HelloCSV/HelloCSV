import { SheetState, SheetRow } from '../types';

export function getTotalRows(sheetData: SheetState[]) {
  return sheetData.reduce((total, sheet) => total + sheet.rows.length, 0);
}

function getCsv(rows: SheetRow[]) {
  const headers = Object.keys(rows[0]);
  const CsvContent = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => `"${row[h]}"`).join(',')),
  ].join('\n');

  const blob = new Blob([CsvContent], { type: 'text/Csv;charset=utf-8;' });
  return blob;
}

function exportCsv(sheetId: string, rows: SheetRow[]) {
  const blob = getCsv(rows);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${sheetId}_processed_${new Date().toISOString()}.Csv`;
  link.click();
}

export function exportAllCsvs(sheetData: SheetState[]) {
  sheetData.forEach((sheet) => {
    exportCsv(sheet.sheetId, sheet.rows);
  });
}

const getCsvSize = (rows: SheetRow[]) => {
  const blob = getCsv(rows);

  return blob.size;
};

export const getDataSize = (sheetData: SheetState[]) => {
  if (!sheetData.length) return 0;

  return sheetData.reduce((totalSize, sheet) => {
    return totalSize + getCsvSize(sheet.rows);
  }, 0);
};
