import { Alert } from '../../components';
import { useTranslations } from '../../i18';
import { SheetState, ImportStatistics, ImporterMode } from '../../types';
import { getTotalRows } from '../utils';
import Summary from './Summary';

type Mode = Extract<ImporterMode, 'completed'>;

export default function Completed({
  sheetData,
  importStatistics,
  mode,
  rowFile,
}: {
  sheetData: SheetState[];
  importStatistics?: ImportStatistics;
  mode: Mode;
  rowFile?: File;
}) {
  const { t } = useTranslations();
  const totalRecords = getTotalRows(sheetData);
  const recordsImported = importStatistics?.recordsImported ?? 0;

  return (
    <div className="flex flex-col space-y-6">
      <Alert
        variant="success"
        header={t('importStatus.importSuccessful')}
        description={t(
          `importStatus.successDescription${importStatistics ? 'WithStats' : ''}`,
          {
            totalRecords,
            recordsImported,
          }
        )}
      />
      <Summary
        mode={mode}
        sheetData={sheetData}
        importStatistics={importStatistics}
        rowFile={rowFile}
      />
    </div>
  );
}
