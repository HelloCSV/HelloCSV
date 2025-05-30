import { useRef, useState } from 'preact/hooks';
import { Button, Card } from '@/components';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useTranslations } from '@/i18';
import { SUPPORTED_FILE_MIME_TYPES } from '@/constants';
import { formatFileSize } from '../utils';
import { useImporterDefinition } from '@/importer/hooks';

interface Props {
  setFile: (file: File) => void;
  onEnterDataManually?: () => void;
}

export default function FileUploader({ setFile, onEnterDataManually }: Props) {
  const { maxFileSizeInBytes, customFileLoaders, allowManualDataEntry } =
    useImporterDefinition();

  const { t, tHtml } = useTranslations();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const supportedMimeTypes = SUPPORTED_FILE_MIME_TYPES.concat(
    customFileLoaders?.map((loader) => loader.mimeType) ?? []
  );

  // TODO: Add error handling
  const validateAndSetFile = (file: File, maxFileSizeInBytes: number) => {
    if (!supportedMimeTypes.includes(file.type)) {
      return;
    }

    if (file.size <= maxFileSizeInBytes) {
      setFile(file);
    }
  };

  const handleFileSelect = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      validateAndSetFile(input.files[0], maxFileSizeInBytes);
    }
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer?.files.length) {
      validateAndSetFile(event.dataTransfer.files[0], maxFileSizeInBytes);
    }
  };

  return (
    <Card variant="muted" withPadding={false} className="h-full">
      <div
        className={`flex h-full flex-col p-5 transition-colors ${isDragging ? 'bg-hello-csv-muted-light' : 'bg-hello-csv-muted'}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => handleDrop(e)}
      >
        <div className="flex flex-1 flex-col items-center justify-center">
          <CloudArrowUpIcon className="text-hello-csv-primary h-12 w-12" />
          <p className="mt-3 text-center">{t('uploader.dragAndDrop')}</p>
          <div className="mt-3 text-sm text-gray-500">
            {tHtml('uploader.maxFileSizeInBytes', {
              size: <b>{formatFileSize(maxFileSizeInBytes)}</b>,
            })}{' '}
            •{' '}
            {['CSV', 'TSV']
              .concat(customFileLoaders?.map((loader) => loader.label) ?? [])
              .join(', ')}
          </div>
          <div className="mt-3">
            <Button>{t('uploader.browseFiles')}</Button>
          </div>
          {allowManualDataEntry && (
            <div className="mt-3 text-sm">
              <p
                role="button"
                tabIndex={0}
                aria-label={t('uploader.enterManually')}
                onClick={(e) => {
                  e.stopPropagation();
                  onEnterDataManually?.();
                }}
                className="text-hello-csv-primary hover:text-hello-csv-primary cursor-pointer decoration-2 opacity-90 hover:underline focus:underline focus:outline-none"
              >
                {t('uploader.enterManually')}
              </p>
            </div>
          )}
        </div>

        <input
          aria-label={t('uploader.uploadAFile')}
          ref={fileInputRef}
          type="file"
          accept={supportedMimeTypes.join(',')}
          className="sr-only"
          onChange={(e) => handleFileSelect(e)}
        />
      </div>
    </Card>
  );
}
