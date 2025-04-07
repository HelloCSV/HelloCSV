import { Alert, Button } from '../../components';
import { useTranslations } from '../../i18';
import { SheetState, ImportStatistics, ImporterMode } from '../../types';
import { getTotalRows } from '../utils';
import Summary from './Summary';

type Mode = Extract<ImporterMode, 'completed'>;

export default function Completed({
  sheetData,
  statistics,
  mode,
  rowFile,
  resetState,
}: {
  sheetData: SheetState[];
  statistics?: ImportStatistics;
  mode: Mode;
  rowFile?: File;
  resetState: () => void;
}) {
  const { t } = useTranslations();
  const totalRecords = getTotalRows(sheetData);
  const recordsImported = statistics?.imported ?? 0;

  return (
    <div className="flex flex-col space-y-6">
      <Alert
        variant="success"
        header={t('importStatus.importSuccessful')}
        description={t(
          `importStatus.successDescription${statistics ? 'WithStats' : ''}`,
          {
            totalRecords,
            recordsImported,
          }
        )}
      />
      <Summary
        mode={mode}
        sheetData={sheetData}
        statistics={statistics}
        rowFile={rowFile}
      />
      <div className="mt-auto flex-none">
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" outline onClick={resetState}>
            New import
          </Button>
        </div>
      </div>
    </div>
  );
}
