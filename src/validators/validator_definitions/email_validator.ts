import { EmailValidatorDefinition } from '../types';
import { RegexValidator } from './regex_validator';

export class EmailValidator extends RegexValidator {
  constructor(definition: EmailValidatorDefinition) {
    super({
      ...definition,
      regex:
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      validate: 'email',
    });
  }
}
