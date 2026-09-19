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
  availableActionList,
} from '../types';
import { ThemeSetter } from '../theme/ThemeSetter';
import { generateCsvContent, getSubmittedSheetData } from '../utils';
import SheetsSwitcher from '../sheet/components/SheetsSwitcher';
import { Button, Root, Tooltip } from '../components';
import { TranslationProvider, useTranslations } from '../i18';
import BackToMappingButton from './components/BackToMappingButton';
import { Uploader } from '../uploader';
import { getEnumLabelDict } from '../sheet/utils';
import { ImporterDefinitionProvider } from './hooks';
import { InnerStateBuilder } from './state';
import { useUndoRedo } from './useUndoRedo';
import { useSheetRowLimits } from './useSheetRowLimits';

function ImporterBody(importerDefinition: ImporterDefinitionWithDefaults) {
  const { onComplete, sheets, availableActions } = importerDefinition;

  const { t } = useTranslations();

  const isInitialRender = useRef(true);
  const targetRef = useRef<HTMLDivElement | null>(null);

  const state = useImporterState();
  const dispatch = useImporterStateDispatch();

  const idPrefix = useId();

  const { mode, currentSheetId, sheetData, columnMappings, validationErrors } =
    state;

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

  const { preventUpload, uploadBlockedTooltip } = useSheetRowLimits();

  const stateBuilder = new InnerStateBuilder(importerDefinition, state);

  const history = useUndoRedo();

  // Snapshot the current data before a mutating operation so it can be undone.
  // Called once per user operation — a multi-cell paste (a single onCellsChanged)
  // therefore records one snapshot and is reverted by a single undo.
  function recordHistory() {
    history.record(sheetData);
  }

  async function onFileUploaded(file: File) {
    await stateBuilder.uploadFile(file);
    stateBuilder.dispatchChange(dispatch);
  }

  function onEnterDataManually() {
    history.reset();
    stateBuilder.setEnterDataManually();
    stateBuilder.dispatchChange(dispatch);
  }

  function onMappingsChanged(mappings: ColumnMapping[]) {
    stateBuilder.setMappings(mappings);
    stateBuilder.dispatchChange(dispatch);
  }

  async function onMappingsSet() {
    // Entering the preview with a freshly mapped dataset starts a new history.
    history.reset();
    await stateBuilder.confirmMappings();
    stateBuilder.dispatchChange(dispatch);
  }

  function onCellChanged(payload: CellChangedPayload) {
    recordHistory();
    stateBuilder.changeCell(payload);
    stateBuilder.dispatchChange(dispatch);
  }

  // Apply many cell edits (paste, fill-down, range clear) under a single
  // validation run. Payloads must already be coalesced to one merged row per
  // rowIndex (see groupChangesByRow) — changeCell accumulates whole-row steps.
  function onCellsChanged(payloads: CellChangedPayload[]) {
    if (payloads.length === 0) return;
    recordHistory();
    payloads.forEach((payload) => stateBuilder.changeCell(payload));
    stateBuilder.dispatchChange(dispatch);
  }

  function onRemoveRows(payload: RemoveRowsPayload) {
    recordHistory();
    stateBuilder.removeRows(payload);
    stateBuilder.dispatchChange(dispatch);
  }

  function addEmptyRow() {
    recordHistory();
    dispatch({ type: 'ADD_EMPTY_ROW' });
  }

  function onUndo() {
    const snapshot = history.undo(sheetData);
    if (snapshot == null) return;

    stateBuilder.restoreSheetData(snapshot);
    stateBuilder.dispatchChange(dispatch);
  }

  function onRedo() {
    const snapshot = history.redo(sheetData);
    if (snapshot == null) return;

    stateBuilder.restoreSheetData(snapshot);
    stateBuilder.dispatchChange(dispatch);
  }

  function resetState() {
    history.reset();
    dispatch({ type: 'RESET' });
  }

  async function onSubmit() {
    dispatch({ type: 'PROGRESS', payload: { progress: 0 } });
    dispatch({ type: 'SUBMIT' });
    try {
      // TODO: Should we filter invalid data?
      const data = getSubmittedSheetData(sheets, sheetData);

      const statistics = await onComplete(
        { ...state, sheetData: data },
        (progress) => {
          dispatch({ type: 'PROGRESS', payload: { progress } });
        },
        state.sheetDefinitions.map((sheetDefinition) => ({
          file: generateCsvContent(
            sheetDefinition,
            data.find((sheet) => sheet.sheetId === sheetDefinition.id)?.rows ??
              [],
            {},
            'value'
          ),
          sheetId: sheetDefinition.id,
        }))
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
      <Root ref={targetRef}>
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
                setRowsData={onCellsChanged}
                removeRows={onRemoveRows}
                addEmptyRow={addEmptyRow}
                resetState={resetState}
                undo={onUndo}
                redo={onRedo}
                canUndo={history.canUndo}
                canRedo={history.canRedo}
                enumLabelDict={enumLabelDict}
              />
            </div>
            <div className="flex-none">
              {currentSheetData.rows.length > 0 && (
                <div className="mt-5 flex justify-between">
                  <div>
                    {columnMappings != null &&
                      availableActions.includes('backToPreviousStep') && (
                        <BackToMappingButton
                          onBackToMapping={onBackToMapping}
                        />
                      )}
                  </div>
                  <Tooltip
                    tooltipText={uploadBlockedTooltip}
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
    availableActions: props.availableActions ?? [...availableActionList],
  };

  return (
    <ImporterDefinitionProvider importerDefintion={propsWithDefaults}>
      <ReducerProvider
        sheets={propsWithDefaults.sheets}
        persistenceConfig={propsWithDefaults.persistenceConfig}
        initialState={propsWithDefaults.initialState}
        onStateChanged={propsWithDefaults.onStateChanged}
      >
        <TranslationProvider>
          <ImporterBody {...propsWithDefaults} />
        </TranslationProvider>
      </ReducerProvider>
    </ImporterDefinitionProvider>
  );
}
