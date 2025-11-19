import { PostalCodeValidatorDefinition } from '../types';
import { RegexValidator } from './regex_validator';

export class PostalCodeValidator extends RegexValidator {
  constructor(definition: PostalCodeValidatorDefinition) {
    super({
      ...definition,
      regex: /^\d{5}(-\d{4})?$/,
    });
  }
}
