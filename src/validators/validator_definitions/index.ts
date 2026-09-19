import {
  ImporterValidatorDefinitionBase,
  ImporterValidatorType,
} from '../types';
import { Validator } from './base';
import { BooleanValidator } from './boolean_validator';
import { CustomValidator } from './custom_validator';
import { EmailValidator } from './email_validator';
import { IncludesValidator } from './includes_validator';
import { IntegerValidator } from './integer_validator';
import { MultiIncludesValidator } from './multi_includes_validator';
import { PhoneNumberValidator } from './phone_number_validator';
import { PostalCodeValidator } from './postal_code_validator';
import { RegexValidator } from './regex_validator';
import { RequiredValidator } from './required_validator';
import { UniqueValidator } from './unique_validator';

export * from './base';
export * from './boolean_validator';
export * from './custom_validator';
export * from './email_validator';
export * from './includes_validator';
export * from './multi_includes_validator';
export * from './phone_number_validator';
export * from './postal_code_validator';
export * from './regex_validator';
export * from './required_validator';
export * from './unique_validator';

export function buildValidatorFromDefinition(
  definition: ImporterValidatorDefinitionBase
) {
  const mapping: {
    [key in ImporterValidatorType]: typeof Validator;
  } = {
    regex_matches: RegexValidator,
    required: RequiredValidator,
    unique: UniqueValidator,
    includes: IncludesValidator,
    multi_includes: MultiIncludesValidator,
    boolean: BooleanValidator,
    is_integer: IntegerValidator,
    postal_code: PostalCodeValidator,
    phone_number: PhoneNumberValidator,
    email: EmailValidator,
    custom: CustomValidator,
  };
  if (!(definition.validate in mapping)) {
    throw new Error(
      `Missing validator for ${
        definition.validate
      }. Valid validator options are ${Object.keys(mapping).join(', ')}`
    );
  }
  const FoundValidator = mapping[definition.validate];
  return new FoundValidator(definition);
}
