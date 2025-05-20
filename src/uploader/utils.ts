import { SheetDefinition } from '../types';
import { CustomFileLoader, ImporterRequirementsType } from './types';
import { fieldIsRequired } from '../validators';
import { allowUserToMapColumn } from '../mapper';

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

const loadFile = async (file: File): Promise<ProgressEvent<FileReader>> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event);
    };
    reader.readAsArrayBuffer(file);
  });
};

export const convertCsvFile = async (
  file: File,
  customFileLoaders: CustomFileLoader[] | undefined
) => {
  const matchedCustomFileLoader = customFileLoaders?.find(
    (loader) => loader.mimeType === file.type
  );

  if (matchedCustomFileLoader) {
    return loadFile(file).then((event) => {
      const { fileName, csvData } = matchedCustomFileLoader.convert(
        event,
        file
      );

      const csvBlob = new Blob([csvData], { type: 'text/csv' });
      const csvFile = new File([csvBlob], fileName, {
        type: 'text/csv',
      });

      return csvFile;
    });
  }

  return file;
};
