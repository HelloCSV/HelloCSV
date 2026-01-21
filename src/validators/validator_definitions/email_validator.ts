import { EmailValidatorDefinition } from '../types';
import { RegexValidator } from './regex_validator';

export class EmailValidator extends RegexValidator {
  constructor(definition: EmailValidatorDefinition) {
    super({
      ...definition,
      regex: /^[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/i,
    });
  }
}
