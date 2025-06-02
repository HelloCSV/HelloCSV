import {
  ImporterOutputFieldType,
  MultiIncludesValidatorDefinition,
} from '../../types';
import { Validator } from './base';

export class MultiIncludesValidator extends Validator {
  delimiter: string | RegExp;

  values: ImporterOutputFieldType[];

  constructor(definition: MultiIncludesValidatorDefinition) {
    super(definition);
    this.delimiter = definition.delimiter || /[,|]/;
    this.values = definition.values;
    if (!this.values) {
      throw new Error('Missing values for `multi_includes` validator');
    }
  }

  isValid(fieldValue: ImporterOutputFieldType) {
    const values = fieldValue?.toString()?.split(this.delimiter) ?? [];
    // If any of the values are not in the list of valid values, then the field is invalid
    if (values.some((value) => !this.values.includes(value.trim()))) {
      return this.definition.error || 'validators.multiIncludes';
    }
  }
}
