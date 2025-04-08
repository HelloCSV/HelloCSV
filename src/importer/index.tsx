import { useReducer, useEffect } from 'preact/compat';
import { useRef } from 'preact/hooks';

import HeaderMapper from '../mapper/components/HeaderMapper';
import SheetDataEditor from '../sheet/components/SheetDataEditor';
import ImportStatus from '../status/components/ImportStatus';
import { delay } from '../utils/timing';
import { buildInitialState, reducer } from './reducer';
import {
  CellChangedPayload,
  ColumnMapping,
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

function ImporterBody({
  theme,
  onComplete,
  allowManualDataEntry,
  sheets,
  onDataColumnsMapped,
  preventUploadOnValidationErrors,
  maxFileSizeInBytes = 20 * 1024 * 1024, // 20MB,
  customSuggestedMapper,
  onSummaryFinished,
}: ImporterDefinition) {
  const { t } = useTranslations();

  const isInitialRender = useRef(true);
  const targetRef = useRef<HTMLDivElement | null>(null);

  const [state, dispatch] = useReducer(reducer, buildInitialState(sheets));

  const {
    mode,
    currentSheetId,
    sheetData,
    columnMappings,
    parsedFile,
    validationErrors,
    importProgress,
    importStatistics,
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

  const currentSheetDefinition = sheets.find(
    (sheet) => sheet.id === currentSheetId
  )!;

  const preventUploadOnErrors =
    typeof preventUploadOnValidationErrors === 'function'
      ? (preventUploadOnValidationErrors?.(validationErrors) ?? false)
      : (preventUploadOnValidationErrors ?? false);

  const preventUpload = preventUploadOnErrors && validationErrors.length > 0;

  function onFileUploaded(file: File) {
    dispatch({ type: 'FILE_UPLOADED', payload: { file } });

    parseCsv({
      file,
      onCompleted: async (newParsed) => {
        const csvHeaders = newParsed.meta.fields!;

        const suggestedMappings =
          customSuggestedMapper != null
            ? await customSuggestedMapper(sheets, csvHeaders)
            : buildSuggestedHeaderMappings(sheets, csvHeaders);

        dispatch({ type: 'FILE_PARSED', payload: { parsed: newParsed } });

        dispatch({
          type: 'COLUMN_MAPPING_CHANGED',
          payload: {
            mappings: suggestedMappings,
          },
        });
      },
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
      // TODO THIS BRANCH: Should we filter invalid data?
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
    <ThemeSetter theme={theme}>
      <Root
        ref={targetRef}
        className={`${mode === 'submit' || mode === 'failed' || mode === 'completed' ? 'h-full' : ''}`}
      >
        {mode === 'upload' && (
          <Uploader
            sheets={sheets}
            onFileUploaded={onFileUploaded}
            onEnterDataManually={onEnterDataManually}
            allowManualDataEntry={allowManualDataEntry}
            maxFileSizeInBytes={maxFileSizeInBytes}
          />
        )}

        {mode === 'mapping' && (
          <HeaderMapper
            parsed={parsedFile!}
            sheetDefinitions={sheets}
            currentMapping={columnMappings ?? []}
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
                activeSheetId={currentSheetId}
                sheetDefinitions={sheets}
                onSheetChange={(sheetId) =>
                  dispatch({ type: 'SHEET_CHANGED', payload: { sheetId } })
                }
                validationErrors={validationErrors}
              />
            </div>
            <div className="flex-1 overflow-auto">
              <SheetDataEditor
                data={currentSheetData}
                allData={sheetData}
                sheetDefinition={currentSheetDefinition}
                sheetValidationErrors={validationErrors.filter(
                  (error) => error.sheetId === currentSheetDefinition?.id
                )}
                setRowData={onCellChanged}
                removeRows={onRemoveRows}
                addEmptyRow={addEmptyRow}
                resetState={resetState}
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
            mode={mode}
            progress={importProgress}
            onRetry={onSubmit}
            onBackToPreview={onBackToPreview}
            resetState={resetState}
            sheetData={sheetData}
            statistics={importStatistics}
            rowFile={state.rowFile}
            onSummaryFinished={onSummaryFinished}
          />
        )}
      </Root>
    </ThemeSetter>
  );
}

export default function Importer(props: ImporterDefinition) {
  return (
    <TranslationProvider selectedLocale={props.locale}>
      <ImporterBody {...props} />
    </TranslationProvider>
  );
}
