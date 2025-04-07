import { Alert, Button } from '../../components';
import { useTranslations } from '../../i18';
import { SheetState, ImporterMode } from '../../types';
import Summary from './Summary';

type Mode = Extract<ImporterMode, 'failed'>;

interface Props {
  onRetry: () => void;
  onBackToPreview: () => void;
  rowFile?: File;
  sheetData: SheetState[];
  mode: Mode;
}

export default function Failed({
  onRetry,
  onBackToPreview,
  rowFile,
  sheetData,
  mode,
}: Props) {
  const { t } = useTranslations();

  return (
    <div className="flex h-full flex-col">
      <div className="text-2xl">Data import</div>
      <div className="mt-4">
        <Alert
          variant="error"
          header={t('importStatus.importFailed')}
          description={t('importStatus.failedDescription')}
        />
      </div>
      <div className="mt-6 flex-1">
        <Summary
          mode={mode}
          sheetData={sheetData}
          rowFile={rowFile}
          completedWithErrors={false}
        />
      </div>
      <div className="mt-6">
        <div className="flex justify-between">
          <Button onClick={onBackToPreview} variant="secondary" outline>
            <div className="flex items-center">
              {t('importer.loader.backToPreview')}
            </div>
          </Button>
          <Button onClick={onRetry} variant="primary">
            <div className="flex items-center">
              {t('importer.loader.retry')}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
