import { EnumLabelDict } from '@/types';
import { getTotalRows, downloadAllSheetsAsCsv, getDataSize } from '../utils';
import { formatFileSize } from '@/uploader/utils';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/solid';
import { Button, Badge } from '@/components';
import { useTranslations } from '@/i18';
import { useImporterState } from '@/importer/reducer';
import { useImporterDefinition } from '@/importer/hooks';

type Props = {
  completedWithErrors?: boolean;
  enumLabelDict: EnumLabelDict;
};

export default function SummaryInfo({
  completedWithErrors,
  enumLabelDict,
}: Props) {
  const {
    rowFile,
    mode,
    sheetData,
    importStatistics: statistics,
    sheetDefinitions,
  } = useImporterState();
  const { csvDownloadMode } = useImporterDefinition();
  const { t } = useTranslations();
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
              <div className="my-2 text-sm font-light uppercase">
                {t('importStatus.fileInformation')}
              </div>
              <div className="text-md my-2 font-medium">
                {rowFile?.name || 'Data entered manually'}
              </div>
              <div className="my-2 text-sm text-gray-500">
                {rowFile
                  ? `${t('importStatus.original')}: ${formatFileSize(rowFile?.size || 0)} · ${t('importStatus.processed')}: ${formatFileSize(getDataSize(sheetData, sheetDefinitions, enumLabelDict, csvDownloadMode))}`
                  : `${t('importStatus.processed')}: ${formatFileSize(getDataSize(sheetData, sheetDefinitions, enumLabelDict, csvDownloadMode))}`}
              </div>
              <div className="mt-5">
                <Button
                  variant="tertiary"
                  outline
                  onClick={() =>
                    downloadAllSheetsAsCsv(
                      sheetData,
                      sheetDefinitions,
                      enumLabelDict,
                      csvDownloadMode
                    )
                  }
                >
                  {t('importStatus.downloadProcessedData')}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="border-b border-gray-200 pb-2"></div>
        <div>
          <div className="flex flex-row">
            <div className="my-2 mr-5 text-center">
              {mode === 'failed' ? (
                <ExclamationTriangleIcon className="text-hello-csv-danger-light h-8 w-8" />
              ) : completedWithErrors ? (
                <ExclamationCircleIcon className="text-hello-csv-warning-light h-8 w-8" />
              ) : (
                <CheckCircleIcon className="text-hello-csv-success-light h-8 w-8" />
              )}
            </div>
            <div className="flex-1">
              <div className="my-2 text-sm font-light uppercase">
                {t('importStatus.importResults')}
              </div>
              <div className="text-md my-2 font-medium">
                {t('importStatus.totalRows', { totalRows })}
              </div>
              {statistics && (
                <div className="my-2 text-sm text-gray-500">
                  {statistics.skipped >= 0 && (
                    <span>
                      {t('importStatus.statisticsSkipped', {
                        skipped: statistics.skipped,
                      })}
                      {' · '}
                    </span>
                  )}
                  {statistics.failed >= 0 && (
                    <span>
                      {t('importStatus.statisticsFailed', {
                        failed: statistics.failed,
                      })}
                      {' · '}
                    </span>
                  )}
                  {statistics.imported >= 0 && (
                    <span>
                      {t('importStatus.statisticsImported', {
                        imported: statistics.imported,
                      })}
                    </span>
                  )}
                </div>
              )}
              {mode === 'failed' && (
                <div className="my-2 text-sm text-gray-500">
                  {t('importStatus.status')}:{' '}
                  <Badge variant="error">{t('importStatus.failed')}</Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
