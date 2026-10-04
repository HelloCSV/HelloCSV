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
import { getSubmittedSheetData } from '@/utils';

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
    sheetData: stateSheetData,
    importStatistics: statistics,
    sheetDefinitions,
  } = useImporterState();

  const sheetData = getSubmittedSheetData(stateSheetData);

  const { csvDownloadMode } = useImporterDefinition();
  const { t } = useTranslations();
  const totalRows = getTotalRows(sheetData);

  return (
    <div className="hc:flex hc:flex-row hc:px-4 hc:pt-3 hc:pb-2">
      <div className="hc:flex-1 hc:space-y-4">
        <div>
          <div className="hc:flex hc:flex-row">
            <div className="hc:my-2 hc:mr-5 hc:text-center">
              <DocumentTextIcon className="hc:text-hello-csv-primary hc:h-8 hc:w-8" />
            </div>
            <div className="hc:flex-1">
              <div className="hc:my-2 hc:text-sm hc:font-light hc:uppercase">
                {t('importStatus.fileInformation')}
              </div>
              <div className="hc:text-base hc:my-2 hc:font-medium">
                {rowFile?.name || 'Data entered manually'}
              </div>
              <div className="hc:text-hello-csv-text-muted hc:my-2 hc:text-sm">
                {rowFile
                  ? `${t('importStatus.original')}: ${formatFileSize(rowFile?.size || 0)} · ${t('importStatus.processed')}: ${formatFileSize(getDataSize(sheetData, sheetDefinitions, enumLabelDict, csvDownloadMode))}`
                  : `${t('importStatus.processed')}: ${formatFileSize(getDataSize(sheetData, sheetDefinitions, enumLabelDict, csvDownloadMode))}`}
              </div>
              <div className="hc:mt-5">
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
        <div className="hc:border-hello-csv-border hc:border-b hc:pb-2"></div>
        <div>
          <div className="hc:flex hc:flex-row">
            <div className="hc:my-2 hc:mr-5 hc:text-center">
              {mode === 'failed' ? (
                <ExclamationTriangleIcon className="hc:text-hello-csv-danger-light hc:h-8 hc:w-8" />
              ) : completedWithErrors ? (
                <ExclamationCircleIcon className="hc:text-hello-csv-warning-light hc:h-8 hc:w-8" />
              ) : (
                <CheckCircleIcon className="hc:text-hello-csv-success-light hc:h-8 hc:w-8" />
              )}
            </div>
            <div className="hc:flex-1">
              <div className="hc:my-2 hc:text-sm hc:font-light hc:uppercase">
                {t('importStatus.importResults')}
              </div>
              <div className="hc:text-base hc:my-2 hc:font-medium">
                {t('importStatus.totalRows', { totalRows })}
              </div>
              {statistics && (
                <div className="hc:text-hello-csv-text-muted hc:my-2 hc:text-sm">
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
                <div className="hc:text-hello-csv-text-muted hc:my-2 hc:text-sm">
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
