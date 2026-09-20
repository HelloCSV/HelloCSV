import { DateColumnType, ImporterOutputFieldType, SheetRow } from '../types';

export interface ImporterValidationError {
  sheetId: string;
  rowIndex: number;
  columnId: string;
  message: string;
}

type ImporterValidatorBaseOutput = string | null | undefined;
export type ImporterValidatorOutput =
  | ImporterValidatorBaseOutput
  | Promise<ImporterValidatorBaseOutput>;

export type ImporterValidatorType =
  | 'regex_matches'
  | 'required'
  | 'unique'
  | 'includes'
  | 'multi_includes'
  | 'boolean'
  | 'is_integer'
  | 'phone_number'
  | 'email'
  | 'postal_code'
  | 'date'
  | 'custom';

export interface UniqueValidatorDefinition
  extends ImporterValidatorDefinitionBase {
  validate: 'unique';
  caseInsensitive?: boolean;
}

export type ImporterValidatorDefinition =
  | RequiredValidatorDefinition
  | UniqueValidatorDefinition
  | ImporterValidatorDefinitionBase
  | MultiIncludesValidatorDefinition
  | IncludesValidatorDefinition
  | CustomValidatorDefinition
  | RegexValidatorDefinition
  | EmailValidatorDefinition
  | PhoneNumberValidatorDefinition
  | PostalCodeValidatorDefinition
  | DateValidatorDefinition;

export interface ImporterValidatorDefinitionBase {
  validate: ImporterValidatorType;
  error?: string;
}

export interface RequiredValidatorDefinition
  extends ImporterValidatorDefinitionBase {
  validate: 'required';
  when?: (row: SheetRow) => boolean;
}

export interface MultiIncludesValidatorDefinition
  extends ImporterValidatorDefinitionBase {
  delimiter?: string | RegExp;
  values: ImporterOutputFieldType[];
}

export interface IncludesValidatorDefinition
  extends ImporterValidatorDefinitionBase {
  values: ImporterOutputFieldType[];
}

export interface RegexValidatorDefinition
  extends ImporterValidatorDefinitionBase {
  regex: string | RegExp;
}

export interface EmailValidatorDefinition
  extends ImporterValidatorDefinitionBase {
  validate: 'email';
}

export interface PhoneNumberValidatorDefinition
  extends ImporterValidatorDefinitionBase {
  validate: 'phone_number';
}

export interface PostalCodeValidatorDefinition
  extends ImporterValidatorDefinitionBase {
  validate: 'postal_code';
}

export interface DateValidatorDefinition
  extends ImporterValidatorDefinitionBase {
  validate: 'date';
  dateType: DateColumnType;
  outputFormat?: string;
  displayFormat?: string;
  min?: string;
  max?: string;
  showSeconds?: boolean;
}

export interface CustomValidatorDefinition
  extends ImporterValidatorDefinitionBase {
  key: string;
  validateFn: (
    fieldValue: ImporterOutputFieldType | undefined,
    row: SheetRow
  ) => ImporterValidatorOutput;
}
