import { hasData, eachWithObject } from '../utils/functional';
import {
  ImporterValidationError,
  ImporterValidatorDefinition,
  RequiredValidatorDefinition,
} from './types';
import { SheetColumnDefinition, SheetDefinition, SheetState } from '../types';
import { Validator } from './validator_definitions/base';
import { buildValidatorFromDefinition } from './validator_definitions';
import { extractReferenceColumnPossibleValues } from '../sheet/utils';

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
    result.push({
      values: columnDefinition.typeArguments.values.map((v) => v.value),
      validate: 'includes',
    });
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

  return result;
}

function validateSheet(
  sheetDefinition: SheetDefinition,
  sheetData: SheetState,
  allData: SheetState[]
) {
  const validationErrors: ImporterValidationError[] = [];

  const validatorsByColumnId = eachWithObject<
    SheetColumnDefinition,
    Validator[]
  >(sheetDefinition.columns, (columnDefinition, obj) => {
    obj[columnDefinition.id] = [];

    const validatorDefinitions = [
      ...(columnDefinition.validators ?? []),
      ...automaticFieldValidators(columnDefinition, allData),
    ];

    validatorDefinitions.forEach((validatorDefinition) => {
      obj[columnDefinition.id].push(
        buildValidatorFromDefinition(validatorDefinition)
      );
    });
  });

  sheetDefinition.columns.forEach((columnDefinition) => {
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
      const validators = validatorsByColumnId[columnDefinition.id];

      validators.forEach((v) => {
        const result = v.isValid(value, row);

        if (result != null) {
          validationErrors.push({
            sheetId: sheetDefinition.id,
            columnId: columnDefinition.id,
            rowIndex,
            message: result,
          });
        }
      });
    });
  });

  return validationErrors;
}

export function applyValidations(
  sheetDefinitions: SheetDefinition[],
  sheetStates: SheetState[]
) {
  const validationErrors: ImporterValidationError[] = [];

  sheetDefinitions.forEach((sheetDefinition) => {
    const sheetData = sheetStates.find(
      (state) => state.sheetId === sheetDefinition.id
    );

    if (sheetData) {
      const errors = validateSheet(sheetDefinition, sheetData, sheetStates);

      validationErrors.push(...errors);
    }
  });

  return validationErrors;
}
