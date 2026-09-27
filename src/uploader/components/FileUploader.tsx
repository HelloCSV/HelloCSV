import { useRef, useState } from 'preact/hooks';
import { Button, Card, Error } from '@/components';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useTranslations } from '@/i18';
import {
  SUPPORTED_FILE_EXTENSIONS,
  SUPPORTED_FILE_MIME_TYPES,
} from '@/constants';
import { formatFileSize, getFileExtension } from '../utils';
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
  const [fileError, setFileError] = useState<string | null>(null);
  const supportedMimeTypes = SUPPORTED_FILE_MIME_TYPES.concat(
    customFileLoaders?.map((loader) => loader.mimeType) ?? []
  );
  const supportedExtensions = SUPPORTED_FILE_EXTENSIONS;
  const acceptedFormats = ['CSV', 'TSV']
    .concat(customFileLoaders?.map((loader) => loader.label) ?? [])
    .join(', ');

  const validateAndSetFile = (file: File, maxFileSizeInBytes: number) => {
    const ext = getFileExtension(file.name);
    const validType =
      supportedMimeTypes.includes(file.type) ||
      supportedExtensions.includes(ext);

    if (!validType) {
      setFileError(
        t('uploader.unsupportedFileType', { formats: acceptedFormats })
      );
      return;
    }

    if (file.size > maxFileSizeInBytes) {
      setFileError(
        t('uploader.fileTooLarge', { size: formatFileSize(maxFileSizeInBytes) })
      );
      return;
    }

    setFileError(null);
    setFile(file);
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
    <Card variant="muted" withPadding={false} className="hc:h-full">
      <div
        className={`hc:flex hc:h-full hc:flex-col hc:p-5 hc:transition-colors ${isDragging ? 'hc:bg-hello-csv-muted-light' : 'hc:bg-hello-csv-muted'}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => handleDrop(e)}
      >
        <div className="hc:flex hc:flex-1 hc:flex-col hc:items-center hc:justify-center">
          <CloudArrowUpIcon className="hc:text-hello-csv-primary hc:h-12 hc:w-12" />
          <p className="hc:mt-3 hc:text-center">{t('uploader.dragAndDrop')}</p>
          <div className="hc:text-hello-csv-text-muted hc:mt-3 hc:text-sm">
            {tHtml('uploader.maxFileSizeInBytes', {
              size: <b>{formatFileSize(maxFileSizeInBytes)}</b>,
            })}{' '}
            •{' '}
            {['CSV', 'TSV']
              .concat(customFileLoaders?.map((loader) => loader.label) ?? [])
              .join(', ')}
          </div>
          <div className="hc:mt-3">
            <Button>{t('uploader.browseFiles')}</Button>
          </div>
          {fileError && (
            <div className="hc:mt-2">
              <Error>{fileError}</Error>
            </div>
          )}
          {allowManualDataEntry && (
            <div className="hc:mt-3 hc:text-sm">
              <p
                role="button"
                tabIndex={0}
                aria-label={t('uploader.enterManually')}
                onClick={(e) => {
                  e.stopPropagation();
                  onEnterDataManually?.();
                }}
                className="hc:text-hello-csv-primary hc:hover:text-hello-csv-primary hc:cursor-pointer hc:decoration-2 hc:opacity-90 hc:hover:underline hc:focus:underline hc:focus:outline-none"
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
          accept={supportedMimeTypes.concat(supportedExtensions).join(',')}
          className="hc:sr-only"
          onChange={(e) => handleFileSelect(e)}
        />
      </div>
    </Card>
  );
}
