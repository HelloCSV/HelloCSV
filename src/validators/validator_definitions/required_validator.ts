import { ImporterOutputFieldType } from '../../types';
import { Validator } from './base';

export class RequiredValidator extends Validator {
  isValid(fieldValue: ImporterOutputFieldType) {
    if (fieldValue == null) {
      return this.definition.error || 'validators.required';
    }
  }
}
