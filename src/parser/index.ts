import { CSVParsedData, ParsedFile } from './types';
// This is how package documentation imports the package
// eslint-disable-next-line import/default
import Papa from 'papaparse';

export function parseCsv({
  file,
  onCompleted,
}: {
  file: File;
  onCompleted: (data: ParsedFile) => void;
}) {
  // eslint-disable-next-line import/no-named-as-default-member
  Papa.parse<CSVParsedData>(file, {
    skipEmptyLines: true,
    header: true,
    complete: onCompleted,
  });
}
