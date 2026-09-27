import { Alert, Button } from '@/components';
import { useTranslations } from '@/i18';
import { EnumLabelDict } from '@/types';
import { getTotalRows } from '../utils';
import Summary from './Summary';
import { useImporterDefinition } from '@/importer/hooks';
import { useImporterState } from '@/importer/reducer';
import { getSubmittedSheetData } from '@/utils';

interface Props {
  resetState: () => void;
  enumLabelDict: EnumLabelDict;
}

export default function Completed({ resetState, enumLabelDict }: Props) {
  const {
    sheetDefinitions,
    sheetData: stateSheetData,
    importStatistics: statistics,
  } = useImporterState();
  const { onSummaryFinished } = useImporterDefinition();
  const { t } = useTranslations();

  const sheetData = getSubmittedSheetData(sheetDefinitions, stateSheetData);
  const totalRecords = getTotalRows(sheetData);
  const recordsImported = statistics?.imported ?? 0;
  const completedWithErrors = !!statistics?.failed || !!statistics?.skipped;

  return (
    <div className="hc:flex hc:h-full hc:flex-col">
      <div className="hc:flex-none hc:text-2xl">
        {t('importStatus.dataImport')}
      </div>
      <div className="hc:grow hc:overflow-auto">
        <div className="hc:mt-4">
          <Alert
            variant={completedWithErrors ? 'warning' : 'success'}
            header={t(
              `importStatus.${completedWithErrors ? 'importSuccessfulWithErrors' : 'importSuccessful'}`
            )}
            description={t(
              `importStatus.successDescription${statistics ? 'WithStats' : ''}`,
              {
                totalRecords,
                recordsImported,
              }
            )}
          />
        </div>
        <div className="hc:mt-6">
          <Summary
            completedWithErrors={completedWithErrors}
            enumLabelDict={enumLabelDict}
          />
        </div>
      </div>
      <div className="hc:flex-none">
        <div className="hc:mt-5 hc:flex hc:justify-end">
          <Button variant="primary" onClick={onSummaryFinished || resetState}>
            {t('importStatus.continue')}
          </Button>
        </div>
      </div>
    </div>
  );
}
