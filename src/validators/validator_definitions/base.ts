import { ImporterOutputFieldType, SheetRow } from '../../types';
import {
  ImporterValidatorDefinitionBase,
  ImporterValidatorOutput,
} from '../types';

export class Validator {
  definition: ImporterValidatorDefinitionBase;

  // Empty cells only reach validators that opt in; presence is `required`'s job.
  validatesEmptyValues = false;

  constructor(definition: ImporterValidatorDefinitionBase) {
    this.definition = definition;
  }

  isValid(
    _fieldValue: ImporterOutputFieldType,
    _row: SheetRow
  ): ImporterValidatorOutput {
    throw new Error('Not Implemented');
  }
}
