import { Alert, Button } from '@/components';
import { useTranslations } from '@/i18';
import {
  SheetState,
  ImportStatistics,
  ImporterMode,
  EnumLabelDict,
} from '@/types';
import { getTotalRows } from '../utils';
import Summary from './Summary';
import { useImporterDefinition } from '@/importer/hooks';

type Mode = Extract<ImporterMode, 'completed'>;

interface Props {
  sheetData: SheetState[];
  statistics?: ImportStatistics;
  mode: Mode;
  rowFile?: File;
  resetState: () => void;
  enumLabelDict: EnumLabelDict;
}

export default function Completed({
  sheetData,
  statistics,
  mode,
  rowFile,
  resetState,
  enumLabelDict,
}: Props) {
  const { onSummaryFinished } = useImporterDefinition();
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
          statistics={statistics}
          rowFile={rowFile}
          completedWithErrors={completedWithErrors}
          enumLabelDict={enumLabelDict}
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
