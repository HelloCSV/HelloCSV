import { isEmptyCell, normalizeValue, getColumnDisplayValue } from '../utils';
import {
  EnumLabelDict,
  ImporterOutputFieldType,
  ImporterValidationError,
  SelectOption,
  SheetColumnDefinition,
  SheetColumnReferenceDefinition,
  SheetDefinition,
  SheetRow,
  SheetState,
  SheetViewMode,
} from '../types';
import { useMemo } from 'preact/hooks';
import { ReactNode } from 'preact/compat';

export function extractReferenceColumnPossibleValues(
  columnDefinition: SheetColumnReferenceDefinition,
  allData: SheetState[]
) {
  const referenceArguments = columnDefinition.typeArguments;
  const referenceSheetData = allData.find(
    (data) => data.sheetId === referenceArguments.sheetId
  );

  return (
    referenceSheetData?.rows
      ?.map((row) => row[referenceArguments.sheetColumnId])
      ?.filter((c) => !isEmptyCell(c))
      ?.filter((c, index, allData) => allData.indexOf(c) === index) ?? [] // Remove dupplicates
  );
}

export function findRowIndex(
  allData: SheetState[],
  sheetId: string,
  row: SheetRow
) {
  return allData.find((d) => d.sheetId === sheetId)!.rows.indexOf(row);
}

export function useFilteredRowData(
  data: SheetState,
  allData: SheetState[],
  viewMode: SheetViewMode,
  sheetValidationErrors: ImporterValidationError[],
  errorColumnFilter: string | null,
  sheetDefinition: SheetDefinition,
  searchPhrase: string,
  enumLabelDict: EnumLabelDict
) {
  const rowData = useMemo(() => {
    let rows = data.rows;
    switch (viewMode) {
      case 'errors':
        rows = data.rows.filter((_, index) =>
          sheetValidationErrors.some((error) => error.rowIndex === index)
        );
        break;
      case 'valid':
        rows = data.rows.filter(
          (_, index) =>
            !sheetValidationErrors.some((error) => error.rowIndex === index)
        );
        break;
      case 'all':
      default:
        rows = data.rows;
    }

    if (errorColumnFilter != null) {
      rows = rows.filter((row) => {
        const rowIndex = findRowIndex(allData, sheetDefinition.id, row);
        const error = sheetValidationErrors.find(
          (error) =>
            error.rowIndex === rowIndex && error.columnId === errorColumnFilter
        );
        return error != null;
      });
    }

    if (searchPhrase.trim() !== '') {
      const normalizedSearch = normalizeValue(searchPhrase)!;
      rows = rows.filter((row) =>
        sheetDefinition.columns.some((column) => {
          const cellValue = row[column.id];

          const { displayValue } = getCellDisplayValue(
            sheetDefinition,
            column,
            cellValue,
            enumLabelDict
          );
          return normalizeValue(displayValue)?.includes(normalizedSearch);
        })
      );
    }

    return rows;
  }, [
    data,
    viewMode,
    sheetValidationErrors,
    errorColumnFilter,
    sheetDefinition,
    allData,
    searchPhrase,
    enumLabelDict,
  ]);

  return rowData;
}

export function isColumnReadOnly(
  columnDefinition: SheetColumnDefinition
): boolean {
  if (columnDefinition.type === 'calculated') {
    return true;
  }

  return !!columnDefinition.isReadOnly;
}

export function getEnumLabelDict(sheetDefinitions: SheetDefinition[]) {
  return Object.fromEntries(
    sheetDefinitions.map((sheet) => [
      sheet.id,
      Object.fromEntries(
        sheet.columns
          .filter((column) => column.type === 'enum')
          .map((column) => [
            column.id,
            Object.fromEntries(
              column.typeArguments.values.map(({ label, value }) => [
                value,
                label,
              ])
            ),
          ])
      ),
    ])
  );
}

// Given the current multi-enum cell value and the enum's valid options, return an
// options list that also includes a warning-styled pseudo-option for every current
// value not present in the valid options. This makes invalid tokens (e.g. an
// unmatched value imported from CSV) visible and removable in the editor, instead of
// lingering invisibly in the value array and keeping the cell invalid.
export function buildMultiEnumEditorOptions(
  value: ImporterOutputFieldType,
  values: SelectOption<string>[],
  makeInvalidLabel: (raw: string) => string,
  invalidIcon: ReactNode
): SelectOption<string>[] {
  const current = Array.isArray(value) ? (value as string[]) : [];
  const validValues = new Set(values.map((option) => option.value));

  const invalidOptions = current
    .filter((v) => !validValues.has(v))
    .map((v) => ({
      label: makeInvalidLabel(String(v)),
      value: v,
      icon: invalidIcon,
    }));

  // Invalid options first, for prominence.
  return [...invalidOptions, ...values];
}

export function getCellDisplayValue(
  sheetDefinition: SheetDefinition,
  columnDefinition: SheetColumnDefinition,
  value: ImporterOutputFieldType,
  enumLabelDict: EnumLabelDict
) {
  const extractedValue = getColumnDisplayValue(
    sheetDefinition,
    columnDefinition,
    value,
    enumLabelDict
  );

  const valueEmpty = isEmptyCell(extractedValue);

  // Use non-breaking space to keep the cell height
  return { displayValue: valueEmpty ? '\u00A0' : extractedValue, valueEmpty };
}
