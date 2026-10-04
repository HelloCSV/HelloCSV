import { Dispatch } from 'preact/hooks';
import {
  ImporterAction,
  ImporterDefinitionWithDefaults,
  ImporterState,
} from '../types';
import { InnerStateBuilder } from './state';
import { generateProcessingRunId } from '../validators/utils';
import { generateCsvContent, getSubmittedSheetData } from '../utils';
import { delay } from '../utils/timing';

interface SubmitImporterArgs {
  state: ImporterState;
  dispatch: Dispatch<ImporterAction>;
  importerDefinition: ImporterDefinitionWithDefaults;
}

export async function submitImporter({
  state,
  dispatch,
  importerDefinition,
}: SubmitImporterArgs): Promise<void> {
  const runId = generateProcessingRunId();
  dispatch({ type: 'PROCESSING_STARTED', payload: { runId } });

  const submitBuilder = new InnerStateBuilder(importerDefinition, state);
  const submitState = await submitBuilder.getState('submit');
  const mergedErrors = [
    ...state.validationErrors,
    ...submitState.validationErrors,
  ];

  dispatch({
    type: 'PROCESSING_COMPLETED',
    payload: { sheetData: submitState.sheetData, errors: mergedErrors, runId },
  });

  const preventConfig = importerDefinition.preventUploadOnValidationErrors;
  const preventOnErrors =
    typeof preventConfig === 'function'
      ? (preventConfig(mergedErrors) ?? false)
      : (preventConfig ?? false);

  if (preventOnErrors && mergedErrors.length > 0) {
    // Errors are now visible in the preview grid; stay put.
    return;
  }

  dispatch({ type: 'PROGRESS', payload: { progress: 0 } });
  dispatch({ type: 'SUBMIT' });
  try {
    const data = getSubmittedSheetData(submitState.sheetData);

    const statistics = await importerDefinition.onComplete(
      { ...state, sheetData: data, validationErrors: mergedErrors },
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
  } catch (_) {
    dispatch({ type: 'FAILED' });
  }
}
