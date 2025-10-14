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
    <div className="flex h-full flex-col">
      <div className="flex-none text-2xl">{t('importStatus.dataImport')}</div>
      <div className="grow overflow-auto">
        <div className="mt-4">
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
        <div className="mt-6">
          <Summary
            completedWithErrors={completedWithErrors}
            enumLabelDict={enumLabelDict}
          />
        </div>
      </div>
      <div className="flex-none">
        <div className="mt-5 flex justify-end">
          <Button variant="primary" onClick={onSummaryFinished || resetState}>
            {t('importStatus.continue')}
          </Button>
        </div>
      </div>
    </div>
  );
}
