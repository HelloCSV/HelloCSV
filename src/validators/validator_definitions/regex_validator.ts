import { ImporterOutputFieldType } from '../../types';
import { RegexValidatorDefinition } from '../types';
import { Validator } from './base';

function escapeStringRegExp(str: string) {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

export class RegexValidator extends Validator {
  regexp: RegExp;

  constructor(definition: RegexValidatorDefinition) {
    super(definition);
    if (typeof definition.regex === 'object') {
      this.regexp = definition.regex;
    } else {
      this.regexp = new RegExp(escapeStringRegExp(definition.regex));
    }
  }

  isValid(fieldValue: ImporterOutputFieldType) {
    const matches = this.regexp.test(fieldValue?.toString() ?? '');
    if (!matches) {
      return this.definition.error || 'validators.regex';
    }
  }
}
