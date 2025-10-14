import { isEmptyCell } from '@/utils';
import {
  ImporterOutputFieldType,
  RequiredValidatorDefinition,
  SheetRow,
} from '../../types';
import { Validator } from './base';

export class RequiredValidator extends Validator {
  when: (row: SheetRow) => boolean;

  constructor(definition: RequiredValidatorDefinition) {
    super(definition);
    this.when = definition.when ?? (() => true);
  }

  isValid(fieldValue: ImporterOutputFieldType, row: SheetRow) {
    if (!this.when(row)) {
      return;
    }

    if (isEmptyCell(fieldValue)) {
      return this.definition.error || 'validators.required';
    }
  }
}
