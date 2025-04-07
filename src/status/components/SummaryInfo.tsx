import { ImporterMode, ImportStatistics, SheetState } from '../../types';
import { getTotalRows } from '../utils';
import { formatFileSize } from '../../uploader/utils';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Button } from '../../components';

type Mode = Extract<ImporterMode, 'submit' | 'failed' | 'completed'>;

type Props = {
  sheetData: SheetState[];
  mode: Mode;
  importStatistics?: ImportStatistics;
  rowFile?: File;
};

export default function SummaryInfo({
  sheetData,
  importStatistics,
  rowFile,
}: Props) {
  const totalRows = getTotalRows(sheetData);

  return (
    <div className="flex flex-row px-4 pt-3 pb-2">
      <div className="flex-1 space-y-4">
        <div>
          <div className="flex flex-row">
            <div className="my-2 mr-5 text-center">
              <DocumentTextIcon className="text-hello-csv-primary h-8 w-8" />
            </div>
            <div className="flex-1">
              {rowFile && (
                <>
                  <div className="my-2 text-sm font-light uppercase">
                    File information
                  </div>
                  <div className="text-md my-2 font-medium">{rowFile.name}</div>
                  <div className="my-2 text-sm text-gray-500">
                    Original: {formatFileSize(rowFile.size)} · Processed:{' '}
                    {formatFileSize(
                      sheetData.reduce(
                        (acc, sheet) => acc + sheet.rows.length,
                        0
                      )
                    )}
                    {/* TODO: Improve the size of the parsed file */}
                  </div>
                  <div className="mt-5">
                    <Button variant="secondary" outline onClick={() => {}}>
                      Download processed file
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="border-b border-gray-200 pb-2"></div>
        <div>
          <div className="flex flex-row">
            <div className="my-2 mr-5 text-center">
              <CheckCircleIcon className="text-hello-csv-success-light h-8 w-8" />
            </div>
            <div className="flex-1">
              <div className="my-2 text-sm font-light uppercase">
                Processing results
              </div>
              <div className="text-md my-2 font-medium">
                {totalRows} records processed
              </div>
              <div className="my-2 text-sm text-gray-500">
                {importStatistics?.recordsImported} records imported ·{' '}
                {importStatistics?.recordsFailed} records failed to import
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
