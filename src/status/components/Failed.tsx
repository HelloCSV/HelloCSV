import { Alert, Button } from '@/components';
import { useTranslations } from '@/i18';
import { EnumLabelDict } from '@/types';
import Summary from './Summary';

interface Props {
  onRetry: () => void;
  onBackToPreview: () => void;
  enumLabelDict: EnumLabelDict;
}

export default function Failed({
  onRetry,
  onBackToPreview,
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
          <Summary completedWithErrors={false} enumLabelDict={enumLabelDict} />
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
