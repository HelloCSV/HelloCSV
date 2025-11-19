import { PhoneNumberValidatorDefinition } from '../types';
import { RegexValidator } from './regex_validator';

export class PhoneNumberValidator extends RegexValidator {
  constructor(definition: PhoneNumberValidatorDefinition) {
    super({
      ...definition,
      regex: /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/,
    });
  }
}
