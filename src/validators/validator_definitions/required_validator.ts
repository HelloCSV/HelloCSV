import { isEmptyCell } from '@/utils';
import { ImporterOutputFieldType } from '../../types';
import { Validator } from './base';

export class RequiredValidator extends Validator {
  isValid(fieldValue: ImporterOutputFieldType) {
    if (isEmptyCell(fieldValue)) {
      return this.definition.error || 'validators.required';
    }
  }
}
