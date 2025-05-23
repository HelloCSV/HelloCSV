import { Alert, Button } from '../../components';
import { useTranslations } from '../../i18';
import { SheetState, ImportStatistics, ImporterMode, SheetDefinition } from '../../types';
import { getTotalRows } from '../utils';
import Summary from './Summary';

type Mode = Extract<ImporterMode, 'completed'>;

interface Props {
  sheetData: SheetState[];
  sheetDefinitions: SheetDefinition[];
  statistics?: ImportStatistics;
  mode: Mode;
  rowFile?: File;
  resetState: () => void;
  onSummaryFinished?: () => void;
}

export default function Completed({
  sheetData,
  sheetDefinitions,
  statistics,
  mode,
  rowFile,
  resetState,
  onSummaryFinished,
}: Props) {
  const { t } = useTranslations();
  const totalRecords = getTotalRows(sheetData);
  const recordsImported = statistics?.imported ?? 0;
  const completedWithErrors = !!statistics?.failed || !!statistics?.skipped;

  return (
    <div className="flex flex-col">
      <div className="text-2xl">{t('importStatus.dataImport')}</div>
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
          mode={mode}
          sheetData={sheetData}
          sheetDefinitions={sheetDefinitions}
          statistics={statistics}
          rowFile={rowFile}
          completedWithErrors={completedWithErrors}
        />
        <div className="mt-auto flex-none">
          <div className="mt-5 flex justify-end">
            <Button variant="primary" onClick={onSummaryFinished || resetState}>
              {t('importStatus.continue')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
