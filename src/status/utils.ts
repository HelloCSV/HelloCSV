import {
  SheetState,
  SheetDefinition,
  EnumLabelDict,
  CsvDownloadMode,
} from '../types';
import { downloadSheetAsCsv, generateCsvContent } from '../utils';

export function getTotalRows(sheetData: SheetState[]) {
  return sheetData.reduce((total, sheet) => total + sheet.rows.length, 0);
}

export function downloadAllSheetsAsCsv(
  sheetData: SheetState[],
  sheetDefinitions: SheetDefinition[],
  enumLabelDict: EnumLabelDict,
  csvDownloadMode: CsvDownloadMode
) {
  sheetData.forEach((sheet) => {
    const sheetDefinition = sheetDefinitions.find(
      (s) => s.id === sheet.sheetId
    );
    if (!sheetDefinition) return;

    downloadSheetAsCsv(
      sheetDefinition,
      sheet.rows,
      enumLabelDict,
      csvDownloadMode
    );
  });
}

export const getDataSize = (
  sheetData: SheetState[],
  sheetDefinitions: SheetDefinition[],
  enumLabelDict: EnumLabelDict,
  csvDownloadMode: CsvDownloadMode
) => {
  if (!sheetData.length) return 0;

  return sheetData.reduce((totalSize, sheet) => {
    const sheetDefinition = sheetDefinitions.find(
      (s) => s.id === sheet.sheetId
    );
    if (!sheetDefinition) return totalSize;

    return (
      totalSize +
      generateCsvContent(
        sheetDefinition,
        sheet.rows,
        enumLabelDict,
        csvDownloadMode
      ).size
    );
  }, 0);
};
