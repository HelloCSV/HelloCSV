import { useRef, useEffect, useMemo, useId } from 'preact/hooks';

import HeaderMapper from '../mapper/components/HeaderMapper';
import SheetDataEditor from '../sheet/components/SheetDataEditor';
import ImportStatus from '../status/components/ImportStatus';
import { delay } from '../utils/timing';
import {
  ReducerProvider,
  useImporterState,
  useImporterStateDispatch,
} from './reducer';
import {
  CellChangedPayload,
  ColumnMapping,
  ImporterDefinitionWithDefaults,
  ImporterDefinition,
  RemoveRowsPayload,
} from '../types';
import { ThemeSetter } from '../theme/ThemeSetter';
import { parseCsv } from '../parser';
import { getMappedData } from '../mapper';
import { filterEmptyRows } from '../utils';
import { applyTransformations } from '../transformers';
import { buildSuggestedHeaderMappings } from '../mapper/utils';
import { NUMBER_OF_EMPTY_ROWS_FOR_MANUAL_DATA_INPUT } from '../constants';
import SheetsSwitcher from '../sheet/components/SheetsSwitcher';
import { Button, Root, Tooltip } from '../components';
import { TranslationProvider, useTranslations } from '../i18';
import BackToMappingButton from './components/BackToMappingButton';
import { Uploader } from '../uploader';
import { convertCsvFile } from '../uploader/utils';
import { getEnumLabelDict } from '../sheet/utils';
import { ImporterDefinitionProvider } from './hooks';

function ImporterBody({
  onComplete,
  sheets,
  customFileLoaders,
  onDataColumnsMapped,
  preventUploadOnValidationErrors,
  customSuggestedMapper,
}: ImporterDefinitionWithDefaults) {
  const { t } = useTranslations();

  const isInitialRender = useRef(true);
  const targetRef = useRef<HTMLDivElement | null>(null);

  const state = useImporterState();
  const dispatch = useImporterStateDispatch();

  const idPrefix = useId();

  const {
    mode,
    currentSheetId,
    sheetData,
    columnMappings,
    parsedFile,
    validationErrors,
  } = state;

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    targetRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mode]);

  const currentSheetData = sheetData.find(
    (sheet) => sheet.sheetId === currentSheetId
  )!;

  const sheetCountDict = useMemo(() => {
    return Object.fromEntries(
      sheetData.map((sheet) => [sheet.sheetId, sheet.rows.length])
    );
  }, [sheetData]);

  const currentSheetDefinition = sheets.find(
    (sheet) => sheet.id === currentSheetId
  )!;

  const enumLabelDict = getEnumLabelDict(sheets);

  const preventUploadOnErrors =
    typeof preventUploadOnValidationErrors === 'function'
      ? (preventUploadOnValidationErrors?.(validationErrors) ?? false)
      : (preventUploadOnValidationErrors ?? false);

  const preventUpload = preventUploadOnErrors && validationErrors.length > 0;

  function onFileUploaded(file: File) {
    convertCsvFile(file, customFileLoaders).then((csvFile) => {
      parseCsv({
        file: csvFile,
        onCompleted: async (newParsed) => {
          const csvHeaders = newParsed.meta.fields!;

          const suggestedMappings =
            customSuggestedMapper != null
              ? await customSuggestedMapper(sheets, csvHeaders)
              : buildSuggestedHeaderMappings(sheets, csvHeaders);

          dispatch({
            type: 'FILE_PARSED',
            payload: { parsed: newParsed, rowFile: file },
          });

          dispatch({
            type: 'COLUMN_MAPPING_CHANGED',
            payload: {
              mappings: suggestedMappings,
            },
          });
        },
      });
    });
  }

  function onEnterDataManually() {
    dispatch({
      type: 'ENTER_DATA_MANUALLY',
      payload: {
        amountOfEmptyRowsToAdd: NUMBER_OF_EMPTY_ROWS_FOR_MANUAL_DATA_INPUT,
      },
    });
  }

  function onMappingsChanged(mappings: ColumnMapping[]) {
    dispatch({
      type: 'COLUMN_MAPPING_CHANGED',
      payload: { mappings },
    });
  }

  async function onMappingsSet() {
    const mappedData = getMappedData(sheets, columnMappings ?? [], parsedFile!);

    const newMappedData =
      onDataColumnsMapped != null
        ? await onDataColumnsMapped(mappedData)
        : mappedData;

    dispatch({ type: 'DATA_MAPPED', payload: { mappedData: newMappedData } });
  }

  function onCellChanged(payload: CellChangedPayload) {
    dispatch({ type: 'CELL_CHANGED', payload });
  }

  function onRemoveRows(payload: RemoveRowsPayload) {
    dispatch({ type: 'REMOVE_ROWS', payload });
  }

  function addEmptyRow() {
    dispatch({ type: 'ADD_EMPTY_ROW' });
  }

  function resetState() {
    dispatch({ type: 'RESET' });
  }

  async function onSubmit() {
    dispatch({ type: 'PROGRESS', payload: { progress: 0 } });
    dispatch({ type: 'SUBMIT' });
    try {
      // TODO: Should we filter invalid data?
      const data = applyTransformations(
        sheets,
        sheetData.map((d) => ({ ...d, rows: filterEmptyRows(d) }))
      );

      const statistics = await onComplete(
        { ...state, sheetData: data },
        (progress) => {
          dispatch({ type: 'PROGRESS', payload: { progress } });
        }
      );

      await delay(400);
      dispatch({ type: 'PROGRESS', payload: { progress: 100 } });
      await delay(200);
      dispatch({
        type: 'COMPLETED',
        payload: { importStatistics: statistics ?? undefined },
      });
    } catch (e) {
      dispatch({ type: 'FAILED' });
    }
  }

  function onBackToPreview() {
    dispatch({ type: 'PREVIEW' });
  }

  function onBackToUpload() {
    dispatch({ type: 'UPLOAD' });
  }

  function onBackToMapping() {
    dispatch({ type: 'MAPPING' });
  }

  return (
    <ThemeSetter>
      <Root
        ref={targetRef}
        className={`${mode === 'submit' || mode === 'failed' || mode === 'completed' ? 'h-full' : ''}`}
      >
        {mode === 'upload' && (
          <Uploader
            onFileUploaded={onFileUploaded}
            onEnterDataManually={onEnterDataManually}
          />
        )}

        {mode === 'mapping' && (
          <HeaderMapper
            onMappingsChanged={onMappingsChanged}
            onMappingsSet={onMappingsSet}
            onBack={onBackToUpload}
          />
        )}
        {mode === 'preview' && (
          // TODO: Move these to separate component in future PR
          <div className="flex h-full flex-col">
            <div className="flex-none">
              <SheetsSwitcher
                idPrefix={idPrefix}
                sheetCountDict={sheetCountDict}
                onSheetChange={(sheetId) =>
                  dispatch({ type: 'SHEET_CHANGED', payload: { sheetId } })
                }
              />
            </div>
            <div
              className="flex-1 overflow-auto"
              role="tabpanel"
              id={`${idPrefix}-tabpanel-${currentSheetId}`}
              aria-labelledby={`${idPrefix}-tab-${currentSheetId}`}
              tabIndex={0}
            >
              <SheetDataEditor
                data={currentSheetData}
                sheetDefinition={currentSheetDefinition}
                sheetValidationErrors={validationErrors.filter(
                  (error) => error.sheetId === currentSheetDefinition?.id
                )}
                setRowData={onCellChanged}
                removeRows={onRemoveRows}
                addEmptyRow={addEmptyRow}
                resetState={resetState}
                enumLabelDict={enumLabelDict}
              />
            </div>
            <div className="flex-none">
              {currentSheetData.rows.length > 0 && (
                <div className="mt-5 flex justify-between">
                  <div>
                    {columnMappings != null && (
                      <BackToMappingButton onBackToMapping={onBackToMapping} />
                    )}
                  </div>
                  <Tooltip
                    tooltipText={t('importer.uploadBlocked')}
                    hidden={!preventUpload}
                  >
                    <Button onClick={onSubmit} disabled={preventUpload}>
                      {t('importer.upload')}
                    </Button>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        )}

        {(mode === 'submit' || mode === 'failed' || mode === 'completed') && (
          <ImportStatus
            onRetry={onSubmit}
            onBackToPreview={onBackToPreview}
            resetState={resetState}
            enumLabelDict={enumLabelDict}
          />
        )}
      </Root>
    </ThemeSetter>
  );
}

export default function Importer(props: ImporterDefinition) {
  const propsWithDefaults: ImporterDefinitionWithDefaults = {
    ...props,
    maxFileSizeInBytes: props.maxFileSizeInBytes ?? 20 * 1024 * 1024, // 20MB,
    persistenceConfig: props.persistenceConfig ?? { enabled: false },
    csvDownloadMode: props.csvDownloadMode ?? 'value',
    allowManualDataEntry: props.allowManualDataEntry ?? false,
  };

  return (
    <ImporterDefinitionProvider importerDefintion={propsWithDefaults}>
      <ReducerProvider
        sheets={propsWithDefaults.sheets}
        persistenceConfig={propsWithDefaults.persistenceConfig}
      >
        <TranslationProvider>
          <ImporterBody {...propsWithDefaults} />
        </TranslationProvider>
      </ReducerProvider>
    </ImporterDefinitionProvider>
  );
}
