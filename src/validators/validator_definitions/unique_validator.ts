import { ImporterOutputFieldType } from '../../types';
import { UniqueValidatorDefinition } from '../types';
import { Validator } from './base';

export class UniqueValidator extends Validator {
  seen: Set<ImporterOutputFieldType>;

  caseInsensitive: boolean;

  constructor(definition: UniqueValidatorDefinition) {
    super(definition);
    this.caseInsensitive = definition.caseInsensitive || false;
    this.seen = new Set();
  }

  private comparableValue(fieldValue: ImporterOutputFieldType) {
    if (this.caseInsensitive && typeof fieldValue === 'string') {
      return fieldValue.toLocaleLowerCase();
    }
    return fieldValue;
  }

  isValid(fieldValue: ImporterOutputFieldType) {
    const comparableValue = this.comparableValue(fieldValue);
    if (this.seen.has(comparableValue)) {
      return this.definition.error || 'validators.unique';
    }
    this.seen.add(comparableValue);
  }
}
