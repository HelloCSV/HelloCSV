import { Alert, Button } from '../../components';
import { useTranslations } from '../../i18';
import { SheetState, ImporterMode, EnumLabelDict } from '../../types';
import Summary from './Summary';

type Mode = Extract<ImporterMode, 'failed'>;

interface Props {
  onRetry: () => void;
  onBackToPreview: () => void;
  rowFile?: File;
  sheetData: SheetState[];
  mode: Mode;
  enumLabelDict: EnumLabelDict;
}

export default function Failed({
  onRetry,
  onBackToPreview,
  rowFile,
  sheetData,
  mode,
  enumLabelDict,
}: Props) {
  const { t } = useTranslations();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-full w-full flex-col">
        <div className="text-2xl">{t('importStatus.dataImport')}</div>
        <div className="mt-4">
          <Alert
            variant="error"
            header={t('importStatus.importFailed')}
            description={t('importStatus.failedDescription')}
          />
        </div>
        <div className="mt-6">
          <Summary
            mode={mode}
            sheetData={sheetData}
            rowFile={rowFile}
            completedWithErrors={false}
            enumLabelDict={enumLabelDict}
          />
        </div>

        <div className="mt-6 flex justify-between">
          <Button onClick={onBackToPreview} variant="secondary" outline>
            {t('importer.loader.backToPreview')}
          </Button>
          <Button onClick={onRetry} variant="primary">
            {t('importer.loader.retry')}
          </Button>
        </div>
      </div>
    </div>
  );
}
