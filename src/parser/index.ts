import { CSVParsedData, ParsedFile } from './types';
// This is how package documentation imports the package
// eslint-disable-next-line import/default
import Papa from 'papaparse';

export async function parseCsv({ file }: { file: File }): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line import/no-named-as-default-member
    Papa.parse<CSVParsedData>(file, {
      skipEmptyLines: true,
      header: true,
      complete: (results) => {
        resolve(results as ParsedFile);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

/**
 * Parse quote-aware delimited text into a 2D string array (no header row).
 *
 * Shares the CSV parser (papaparse) so quoted cells containing the delimiter,
 * newlines, or quotes round-trip correctly. Used for clipboard TSV paste.
 */
export function parseDelimitedText(
  text: string,
  delimiter: string
): string[][] {
  if (text === '') {
    return [];
  }

  // eslint-disable-next-line import/no-named-as-default-member
  const result = Papa.parse<string[]>(text, {
    delimiter,
    header: false,
    skipEmptyLines: true,
  });

  return result.data;
}
