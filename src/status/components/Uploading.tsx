import { useTranslations } from '../../i18';
import { Button } from '../../components';
import CircularProgress from './CircularProgress';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useImporterState } from '@/importer/reducer';

interface Props {
  resetState: () => void;
}

function SuccessIcon() {
  return (
    <CheckIcon className="hc:text-hello-csv-success hc:absolute hc:inset-0 hc:m-auto hc:h-12 hc:w-12 hc:stroke-4" />
  );
}

export default function Completed({ resetState }: Props) {
  const { importProgress: progress, mode } = useImporterState();
  const pending = mode === 'submit';
  const { t } = useTranslations();

  return (
    <div className="hc:flex hc:h-full hc:p-10">
      <div className="hc:flex hc:h-full hc:w-full hc:flex-col">
        <div className="hc:my-16 hc:text-center">
          <div className="hc:relative hc:mx-auto hc:h-24 hc:w-24">
            <CircularProgress progress={progress} pending={pending} />
            {pending && (
              <div>
                <div className="hc:absolute hc:inset-0 hc:flex hc:items-center hc:justify-center">
                  <b className="hc:text-lg">{progress}%</b>
                </div>
                <h2 className="hc:text-2xl">
                  {t('importer.loader.uploading')}
                </h2>
              </div>
            )}
            {!pending && <SuccessIcon />}
          </div>
          {!pending && (
            <div className="hc:flex hc:flex-col hc:items-center">
              <h2 className="hc:text-2xl">{t('importer.loader.success')}</h2>
              <div className="hc:h-5" />
              <Button variant="secondary" onClick={resetState}>
                {t('sheet.reset')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
