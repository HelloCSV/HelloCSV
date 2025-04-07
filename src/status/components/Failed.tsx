import { Alert } from '../../components';
import { useTranslations } from '../../i18';
import { SheetState, ImportStatistics, ImporterMode } from '../../types';

type Mode = Extract<ImporterMode, 'failed'>;

export default function Failed({}: {
  sheetData: SheetState[];
  importStatistics?: ImportStatistics;
  mode: Mode;
}) {
  const { t } = useTranslations();

  return (
    <div className="flex flex-col space-y-6">
      <Alert
        variant="error"
        header={t('importStatus.importFailed')}
        description={t('importStatus.failedDescription')}
      />
    </div>
  );
}
