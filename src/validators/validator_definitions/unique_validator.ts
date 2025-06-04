import { ImporterOutputFieldType } from '../../types';
import { ImporterValidatorDefinitionBase } from '../types';
import { Validator } from './base';

export class UniqueValidator extends Validator {
  seen: Set<ImporterOutputFieldType>;

  constructor(definition: ImporterValidatorDefinitionBase) {
    super(definition);
    this.seen = new Set();
  }

  isValid(fieldValue: ImporterOutputFieldType) {
    if (this.seen.has(fieldValue)) {
      return this.definition.error || 'validators.unique';
    }
    this.seen.add(fieldValue);
  }
}
