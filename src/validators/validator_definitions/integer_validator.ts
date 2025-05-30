import { ImporterOutputFieldType } from '../../types';
import { Validator } from './base';

export class IntegerValidator extends Validator {
  isValid(fieldValue: ImporterOutputFieldType) {
    const valid = typeof fieldValue === 'number' && Number.isFinite(fieldValue);

    if (!valid) {
      return this.definition.error || 'validators.integer';
    }
  }
}
