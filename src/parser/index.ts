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
