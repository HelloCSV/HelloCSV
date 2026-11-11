import {
  CustomValidatorDefinition,
  ImporterOutputFieldType,
  ImporterValidatorOutput,
  SheetRow,
} from '../../types';
import { Validator } from './base';

export class CustomValidator extends Validator {
  key?: string;

  validateFn: (
    fieldValue: ImporterOutputFieldType,
    row: SheetRow
  ) => ImporterValidatorOutput;

  constructor(definition: CustomValidatorDefinition) {
    super(definition);

    this.key = definition.key;
    this.validateFn = definition.validateFn;
    this.validatesEmptyValues = definition.validatesEmptyValues ?? true;
  }

  isValid(fieldValue: ImporterOutputFieldType, row: SheetRow) {
    return this.validateFn(fieldValue, row);
  }
}
