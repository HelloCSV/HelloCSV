import { useMemo, useState } from 'preact/hooks';
import { Button, Error, Spinner } from '@/components';
import { useTranslations } from '@/i18';
import { ColumnMapping } from '@/types';
import {
  areAllRequiredMappingsSet,
  calculateMappingExamples,
  calculateNewMappingsForCsvColumnMapingChanged,
  useMappingAvailableSelectOptions,
} from '../utils';
import HeaderMapperDataPreview from './HeaderMapperDataPreview';
import HeaderMapperSelection from './HeaderMapperSelection';
import { useImporterDefinition } from '@/importer/hooks';
import { useImporterState } from '@/importer/reducer';

interface Props {
  onMappingsChanged: (mappings: ColumnMapping[]) => void;
  onMappingsSet: () => Promise<void>;
  onBack: () => void;
}

export default function HeaderMapper({
  onMappingsChanged,
  onMappingsSet,
  onBack,
}: Props) {
  const { columnMappings, parsedFile } = useImporterState();
  const { sheets: sheetDefinitions } = useImporterDefinition();
  const { t } = useTranslations();
  const [hoveredCsvHeader, setHoveredCsvHeader] = useState<string | null>(null);

  const currentMapping = columnMappings ?? [];
  const parsed = parsedFile!;

  const data = parsed.data;
  const csvHeaders = parsed.meta.fields!;

  const mappingSelectOptions = useMappingAvailableSelectOptions(
    sheetDefinitions,
    currentMapping
  );

  const mapingsValid = areAllRequiredMappingsSet(
    sheetDefinitions,
    currentMapping
  );

  const hoveredExamples = useMemo(() => {
    if (!hoveredCsvHeader) return [];
    return calculateMappingExamples(data, hoveredCsvHeader);
  }, [hoveredCsvHeader, data]);

  const [isMappingInProgress, setIsMappingInProgress] = useState(false);

  async function handleConfirm() {
    try {
      setIsMappingInProgress(true);
      await onMappingsSet();
    } finally {
      setIsMappingInProgress(false);
    }
  }

  return (
    <div className="hc:flex hc:h-full hc:flex-col">
      <div className="hc:flex-none hc:text-2xl">
        {t('mapper.reviewAndConfirm')}
      </div>
      <div className="hc:min-h-0 hc:flex-auto">
        <div className="hc:flex hc:h-full hc:justify-between hc:space-x-5">
          <div className="hc:flex hc:flex-2 hc:flex-col">
            <div className="hc:my-5 hc:flex hc:text-sm hc:font-light hc:uppercase">
              <div className="hc:flex-1">{t('mapper.importedColumn')}</div>
              <div className="hc:flex-1">{t('mapper.destinationColumn')}</div>
            </div>
            <div className="hc:flex-1 hc:overflow-y-auto">
              {csvHeaders.map((header, columnIndex) => {
                const headerMapping =
                  currentMapping.find(
                    (mapping) => mapping.csvColumnName === header
                  ) ?? null;

                return (
                  <HeaderMapperSelection
                    key={columnIndex}
                    csvHeader={header}
                    currentMapping={headerMapping}
                    setMapping={(headerMapping) => {
                      const newMappings =
                        calculateNewMappingsForCsvColumnMapingChanged(
                          currentMapping,
                          header,
                          headerMapping
                        );

                      onMappingsChanged(newMappings);
                    }}
                    mappingSelectionOptions={mappingSelectOptions}
                    onMouseEnter={() => {
                      setHoveredCsvHeader(header);
                    }}
                  />
                );
              })}
            </div>
          </div>
          <div className="hc:bg-hello-csv-muted hc:hidden hc:flex-1 hc:overflow-y-auto hc:sm:block">
            <HeaderMapperDataPreview
              examples={hoveredExamples}
              csvHeader={hoveredCsvHeader ?? ''}
            />
          </div>
        </div>
      </div>
      {!mapingsValid && (
        <div className="hc:mt-5 hc:flex hc:justify-end">
          <Error>{t('mapper.mappingsNotValid')}</Error>
        </div>
      )}
      <div className="hc:mt-auto hc:flex-none">
        <div className="hc:mt-5 hc:flex hc:justify-between">
          <Button
            variant="secondary"
            outline
            onClick={onBack}
            disabled={isMappingInProgress}
          >
            {t('mapper.back')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!mapingsValid || isMappingInProgress}
          >
            <div className="hc:flex hc:items-center">
              {isMappingInProgress && (
                <>
                  <Spinner color="light" />
                  <div className="hc:mr-2" />
                </>
              )}
              {t('mapper.confirm')}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
