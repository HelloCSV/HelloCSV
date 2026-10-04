import { hasData, eachWithObject } from '../utils/functional';
import { mapWithConcurrency } from '../utils/concurrency';
import { DEFAULT_MAX_CONCURRENT_ASYNC_OPERATIONS } from '../constants';
import {
  ApplyValidationsOptions,
  ImporterValidationError,
  ImporterValidatorDefinition,
  RequiredValidatorDefinition,
} from './types';
import {
  ImporterOutputFieldType,
  ProcessingPhase,
  SheetColumnDefinition,
  SheetColumnDateTypeArguments,
  SheetDefinition,
  SheetRow,
  SheetState,
  SelectOption,
  isDateLikeColumn,
} from '../types';
import { Validator } from './validator_definitions/base';
import { buildValidatorFromDefinition } from './validator_definitions';
import { extractReferenceColumnPossibleValues } from '../sheet/utils';

interface ValidationTask {
  columnId: string;
  rowIndex: number;
  value: ImporterOutputFieldType;
  row: SheetRow;
  validator: Validator;
}

export function fieldIsRequired(
  columnDefinition: SheetColumnDefinition,
  { skipConditionCheck }: { skipConditionCheck?: boolean } = {}
) {
  if (columnDefinition.validators && columnDefinition.validators.length > 0) {
    const isRequired = columnDefinition.validators.find(
      (v) => v.validate === 'required'
    );
    return (
      isRequired != null &&
      (skipConditionCheck
        ? true
        : (isRequired as RequiredValidatorDefinition).when == null)
    );
  }
  return false;
}

function automaticFieldValidators(
  columnDefinition: SheetColumnDefinition,
  allData: SheetState[]
): ImporterValidatorDefinition[] {
  const result: ImporterValidatorDefinition[] = [];

  if (columnDefinition.type === 'enum') {
    const { values, multiple } = columnDefinition.typeArguments as {
      values: SelectOption<string>[];
      multiple?: boolean;
    };

    const validValues = values.map((v) => v.value);

    if (multiple) {
      result.push({
        values: validValues,
        validate: 'multi_includes',
      });
    } else {
      result.push({
        values: validValues,
        validate: 'includes',
      });
    }
  }

  if (columnDefinition.type === 'reference') {
    const referenceData = extractReferenceColumnPossibleValues(
      columnDefinition,
      allData
    );

    result.push({
      values: referenceData,
      validate: 'includes',
    });
  }

  if (columnDefinition.type === 'boolean') {
    result.push({ validate: 'boolean' });
  }

  if (isDateLikeColumn(columnDefinition)) {
    // Widen to the superset — `date` has no showSeconds (stays undefined).
    const { outputFormat, displayFormat, min, max, showSeconds } =
      (columnDefinition.typeArguments as SheetColumnDateTypeArguments) ?? {};
    result.push({
      validate: 'date',
      dateType: columnDefinition.type,
      outputFormat,
      displayFormat,
      min,
      max,
      showSeconds,
    });
  }

  return result;
}

async function validateSheet(
  sheetDefinition: SheetDefinition,
  sheetData: SheetState,
  allData: SheetState[],
  phase: ProcessingPhase,
  concurrency: number
) {
  const validatorsByColumnId = eachWithObject<
    SheetColumnDefinition,
    Validator[]
  >(sheetDefinition.columns, (columnDefinition, obj) => {
    obj[columnDefinition.id] = [];

    const validatorDefinitions = [
      ...(columnDefinition.validators ?? []).filter(
        (v) => (v.runOn ?? 'change') === phase
      ),
      ...(phase === 'change'
        ? automaticFieldValidators(columnDefinition, allData)
        : []),
    ];

    validatorDefinitions.forEach((validatorDefinition) => {
      obj[columnDefinition.id].push(
        buildValidatorFromDefinition(validatorDefinition)
      );
    });
  });

  // Tasks are collected column-major, in row order, so order-dependent
  // synchronous validators (e.g. `unique`) see rows deterministically even when
  // the concurrency pool interleaves slow async validators.
  const tasks: ValidationTask[] = [];

  sheetDefinition.columns.forEach((columnDefinition) => {
    const validators = validatorsByColumnId[columnDefinition.id];
    if (validators.length === 0) return;

    sheetData.rows.forEach((row, rowIndex) => {
      if (!hasData(row)) {
        return;
      }

      if (
        !(columnDefinition.id in row) &&
        !fieldIsRequired(columnDefinition, { skipConditionCheck: true })
      ) {
        return;
      }

      const value = row[columnDefinition.id];

      validators.forEach((validator) => {
        tasks.push({
          columnId: columnDefinition.id,
          rowIndex,
          value,
          row,
          validator,
        });
      });
    });
  });

  const results = await mapWithConcurrency(
    tasks,
    concurrency,
    async (task): Promise<ImporterValidationError | null> => {
      let message: string | null | undefined;
      try {
        message = await task.validator.isValid(task.value, task.row);
      } catch (_) {
        message = task.validator.definition.error ?? 'validators.asyncError';
      }

      if (message != null) {
        return {
          sheetId: sheetDefinition.id,
          columnId: task.columnId,
          rowIndex: task.rowIndex,
          message,
        };
      }
      return null;
    }
  );

  return results.filter(
    (error): error is ImporterValidationError => error != null
  );
}

export async function applyValidations(
  sheetDefinitions: SheetDefinition[],
  sheetStates: SheetState[],
  options: ApplyValidationsOptions = {}
) {
  const phase = options.phase ?? 'change';
  const concurrency =
    options.concurrency ?? DEFAULT_MAX_CONCURRENT_ASYNC_OPERATIONS;

  const promises = sheetDefinitions.map(async (sheetDefinition) => {
    const sheetData = sheetStates.find(
      (state) => state.sheetId === sheetDefinition.id
    );

    if (sheetData) {
      const errors = await validateSheet(
        sheetDefinition,
        sheetData,
        sheetStates,
        phase,
        concurrency
      );
      return errors;
    }
    return [];
  });

  const allErrors = await Promise.all(promises);
  return allErrors.flat();
}
