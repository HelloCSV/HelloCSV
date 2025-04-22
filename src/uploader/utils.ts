import { SheetDefinition } from '../types';
import { ImporterRequirementsType } from './types';
import { fieldIsRequired } from '../validators';
import { allowUserToMapColumn } from '../mapper';
import * as XLSX from 'xlsx';

export function getImporterRequirements(
  sheets: SheetDefinition[]
): ImporterRequirementsType {
  const groups: ImporterRequirementsType = {
    required: [],
    optional: [],
  };

  sheets.forEach((sheet) => {
    sheet.columns
      .filter((column) => allowUserToMapColumn(column))
      .forEach((column) => {
        const requirement = {
          sheetId: sheet.id,
          columnId: column.id,
          columnLabel: column.label,
        };

        if (fieldIsRequired(column)) {
          groups.required.push(requirement);
        } else {
          groups.optional.push(requirement);
        }
      });
  });

  return groups;
}

export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${Math.round(size)} ${units[unitIndex]}`;
};

export const convertXlsxToCsv = (
  file: File,
  setFile: (file: File) => void
): void => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const data = new Uint8Array(e.target?.result as ArrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const csvData = XLSX.utils.sheet_to_csv(firstSheet);
    const csvBlob = new Blob([csvData], { type: 'text/csv' });
    const csvFile = new File([csvBlob], file.name.replace('.xlsx', '.csv'), {
      type: 'text/csv',
    });
    setFile(csvFile);
  };
  reader.readAsArrayBuffer(file);
};
