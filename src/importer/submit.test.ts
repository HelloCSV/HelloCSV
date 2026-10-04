import { describe, it, expect, vi } from 'vitest';
import { submitImporter } from './submit';
import { buildInitialState } from './state';
import {
  ImporterAction,
  ImporterDefinitionWithDefaults,
  ImporterState,
  SheetDefinition,
} from '../types';

const sheets: SheetDefinition[] = [
  {
    id: 'a',
    label: 'A',
    columns: [
      {
        id: 'name',
        label: 'Name',
        type: 'string',
        validators: [
          {
            validate: 'custom',
            key: 'reject_bad',
            runOn: 'submit',
            validateFn: (value) =>
              value === 'bad' ? 'validators.asyncError' : null,
          },
        ],
      },
    ],
  },
];

function setup(
  name: string,
  overrides: Partial<ImporterDefinitionWithDefaults> = {}
) {
  const state: ImporterState = {
    ...buildInitialState(sheets),
    mode: 'preview',
    sheetData: [{ sheetId: 'a', rows: [{ name }] }],
  };

  const onComplete = vi.fn().mockResolvedValue(undefined);
  const importerDefinition = {
    sheets,
    onComplete,
    preventUploadOnValidationErrors: true,
    maxFileSizeInBytes: 1,
    persistenceConfig: { enabled: false },
    csvDownloadMode: 'value',
    allowManualDataEntry: false,
    availableActions: [],
    ...overrides,
  } as unknown as ImporterDefinitionWithDefaults;

  const dispatched: ImporterAction[] = [];
  const dispatch = vi.fn((action: ImporterAction) => dispatched.push(action));

  return { state, dispatch, dispatched, importerDefinition, onComplete };
}

describe('submitImporter', () => {
  it('enters the processing state before awaiting the (slow) submit pass', () => {
    const { state, dispatch, importerDefinition } = setup('good');

    // Call without awaiting — the processing flag must already be set.
    const promise = submitImporter({ state, dispatch, importerDefinition });

    expect(dispatch).toHaveBeenCalledWith({
      type: 'PROCESSING_STARTED',
      payload: { runId: expect.any(String) },
    });

    return promise;
  });

  it('blocks submission and surfaces errors when a submit validator fails', async () => {
    const { state, dispatch, dispatched, importerDefinition, onComplete } =
      setup('bad');

    await submitImporter({ state, dispatch, importerDefinition });

    const completed = dispatched.find((a) => a.type === 'PROCESSING_COMPLETED');
    expect(completed).toBeTruthy();
    expect(
      completed?.type === 'PROCESSING_COMPLETED' && completed.payload.errors
    ).toHaveLength(1);

    // Submission is blocked: never transitions to submit, onComplete not called.
    expect(dispatched.some((a) => a.type === 'SUBMIT')).toBe(false);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('proceeds to onComplete when the submit pass is clean', async () => {
    const { state, dispatch, dispatched, importerDefinition, onComplete } =
      setup('good');

    await submitImporter({ state, dispatch, importerDefinition });

    expect(dispatched.some((a) => a.type === 'SUBMIT')).toBe(true);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(dispatched.some((a) => a.type === 'COMPLETED')).toBe(true);
  });
});
