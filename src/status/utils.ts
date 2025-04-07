import { SheetState } from '../types';

export function getTotalRows(sheetData: SheetState[]) {
  return sheetData.reduce((total, sheet) => total + sheet.rows.length, 0);
}
