import { ImporterOutputFieldType, SheetState } from '../types';

export const isUndefinedOrNull = (a: any) => {
  return a === null || a === undefined;
};

export const isPresent = (a: any) => !isUndefinedOrNull(a);

export const filterEmptyRows = (state: SheetState) => {
  return state.rows.filter((d) => Object.keys(d).length > 0);
};

export const isEmptyCell = (value: any) => {
  return isUndefinedOrNull(value) || value === '';
};

export const removeDuplicates = (array: any[]) => {
  return [...new Set(array)];
};

export function normalizeValue(
  value: ImporterOutputFieldType | undefined | null
) {
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
