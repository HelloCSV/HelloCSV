import { SheetState, SheetRow } from '../types';

export function getTotalRows(sheetData: SheetState[]) {
  return sheetData.reduce((total, sheet) => total + sheet.rows.length, 0);
}

function getCsv(rows: SheetRow[], headers: string[]) {
  const finalHeaders = rows[0] ? Object.keys(rows[0]) : headers;
  const CsvContent = [
    finalHeaders.join(','),
    ...rows.map((row) =>
      finalHeaders
        .map((h) => {
          let cell = String(row[h] ?? '');

          cell = cell.replace(/"/g, '""');

          if (/[",\n\r]/.test(cell)) {
            cell = `"${cell}"`;
          }

          return cell;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([CsvContent], { type: 'text/csv;charset=utf-8;' });
  return blob;
}

function exportCsv(sheetId: string, rows: SheetRow[], headers: string[]) {
  const blob = getCsv(rows, headers);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${sheetId}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

export function exportAllCsvs(sheetData: SheetState[], headers: string[]) {
  sheetData.forEach((sheet) => {
    exportCsv(sheet.sheetId, sheet.rows, headers);
  });
}

const getCsvSize = (rows: SheetRow[], headers: string[]) => {
  const blob = getCsv(rows, headers);

  return blob.size;
};

export const getDataSize = (sheetData: SheetState[], headers: string[]) => {
  if (!sheetData.length) return 0;

  return sheetData.reduce((totalSize, sheet) => {
    if (sheet.rows.length > 0) {
      return totalSize + getCsvSize(sheet.rows, headers);
    }

    return totalSize;
  }, 0);
};
