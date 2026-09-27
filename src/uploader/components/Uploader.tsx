import ImporterRequirements from './ImporterRequirements';
import FileUploader from './FileUploader';
import { getImporterRequirements } from '../utils';
import { useTranslations } from '@/i18';
import { useImporterDefinition } from '@/importer/hooks';

interface Props {
  onFileUploaded: (file: File) => void;
  onEnterDataManually: () => void;
}

export default function Uploader({
  onFileUploaded,
  onEnterDataManually,
}: Props) {
  const { sheets } = useImporterDefinition();
  const importerRequirements = getImporterRequirements(sheets);
  const { t } = useTranslations();

  return (
    <div className="hc:flex hc:h-full hc:flex-col hc:space-y-4">
      <div className="hc:flex-none hc:text-2xl">
        {t('uploader.uploadAFile')}
      </div>
      <div className="hc:flex-auto hc:md:min-h-0">
        <div className="hc:flex hc:h-full hc:flex-col-reverse hc:gap-5 hc:md:flex-row">
          <div className="hc:h-full hc:flex-1 hc:lg:flex-1">
            <ImporterRequirements importerRequirements={importerRequirements} />
          </div>
          <div className="hc:flex-1 hc:lg:flex-2">
            <FileUploader
              setFile={onFileUploaded}
              onEnterDataManually={onEnterDataManually}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
