import { ImporterMode, ImportStatistics, SheetState } from '../../types';
import { getTotalRows, exportAllCsvs, getDataSize } from '../utils';
import { formatFileSize } from '../../uploader/utils';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Button } from '../../components';

type Mode = Extract<ImporterMode, 'submit' | 'failed' | 'completed'>;

type Props = {
  sheetData: SheetState[];
  mode: Mode;
  statistics?: ImportStatistics;
  rowFile?: File;
};

export default function SummaryInfo({ sheetData, statistics, rowFile }: Props) {
  const totalRows = statistics?.totalRows || getTotalRows(sheetData);

  return (
    <div className="flex flex-row px-4 pt-3 pb-2">
      <div className="flex-1 space-y-4">
        <div>
          <div className="flex flex-row">
            <div className="my-2 mr-5 text-center">
              <DocumentTextIcon className="text-hello-csv-primary h-8 w-8" />
            </div>
            <div className="flex-1">
              <div className="my-2 text-sm font-light uppercase">
                File information
              </div>
              <div className="text-md my-2 font-medium">
                {rowFile?.name || 'Data entered manually'}
              </div>
              <div className="my-2 text-sm text-gray-500">
                {rowFile
                  ? `Original: ${formatFileSize(rowFile?.size || 0)} · Processed: ${formatFileSize(getDataSize(sheetData))}`
                  : 'Processed: ' + formatFileSize(getDataSize(sheetData))}
              </div>
              <div className="mt-5">
                <Button
                  variant="secondary"
                  outline
                  onClick={() => exportAllCsvs(sheetData)}
                >
                  Download processed data
                </Button>
              </div>
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
                Import results
              </div>
              <div className="text-md my-2 font-medium">
                {totalRows} records processed
              </div>
              {statistics && (
                <div className="my-2 text-sm text-gray-500">
                  {statistics.imported} records imported · {statistics.failed}{' '}
                  records failed to import
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
