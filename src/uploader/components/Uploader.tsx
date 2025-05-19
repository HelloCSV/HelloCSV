import { CustomFileLoader, SheetDefinition } from '../../types';
import ImporterRequirements from './ImporterRequirements';
import FileUploader from './FileUploader';
import { getImporterRequirements } from '../utils';
import { useTranslations } from '../../i18';

interface Props {
  sheets: SheetDefinition[];
  onFileUploaded: (file: File) => void;
  onEnterDataManually: () => void;
  allowManualDataEntry?: boolean;
  maxFileSizeInBytes: number;
  customFileLoaders?: CustomFileLoader[];
}

export default function Uploader({
  sheets,
  onFileUploaded,
  onEnterDataManually,
  allowManualDataEntry,
  maxFileSizeInBytes,
  customFileLoaders,
}: Props) {
  const importerRequirements = getImporterRequirements(sheets);
  const { t } = useTranslations();

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex-none text-2xl">{t('uploader.uploadAFile')}</div>
      <div className="flex-auto md:min-h-0">
        <div className="flex h-full flex-col-reverse gap-5 md:flex-row">
          <div className="h-full flex-1 lg:flex-1">
            <ImporterRequirements importerRequirements={importerRequirements} />
          </div>
          <div className="flex-1 lg:flex-2">
            <FileUploader
              setFile={onFileUploaded}
              allowManualDataEntry={allowManualDataEntry}
              onEnterDataManually={onEnterDataManually}
              maxFileSizeInBytes={maxFileSizeInBytes}
              customFileLoaders={customFileLoaders}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
