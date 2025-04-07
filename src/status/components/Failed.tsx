import { Alert, Button } from '../../components';
import { useTranslations } from '../../i18';
import { ArrowUturnRightIcon, PencilIcon } from '@heroicons/react/24/outline';

interface Props {
  onRetry: () => void;
  onBackToPreview: () => void;
}

export default function Failed({ onRetry, onBackToPreview }: Props) {
  const { t } = useTranslations();

  return (
    <div className="flex flex-col space-y-6">
      <Alert
        variant="error"
        header={t('importStatus.importFailed')}
        description={t('importStatus.failedDescription')}
      />
      <div className="flex justify-between">
        <Button onClick={onBackToPreview} variant="primary" outline>
          <div className="flex items-center">
            <PencilIcon className="mr-3 h-4 w-4" />
            {t('importer.loader.backToPreview')}
          </div>
        </Button>
        <Button onClick={onRetry} variant="primary">
          <div className="flex items-center">
            <ArrowUturnRightIcon className="mr-3 h-4 w-4" />
            {t('importer.loader.retry')}
          </div>
        </Button>
      </div>
    </div>
  );
}
