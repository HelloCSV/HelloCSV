import { ImporterOutputFieldType } from '../types';

export type ImporterTransformerDefinition =
  | ImporterTransformerDefinitionBase
  | CustomTransformerDefinition;

export type ImporterTransformerType =
  | 'phone_number'
  | 'postal_code'
  | 'state_code'
  | 'strip'
  | 'custom';

export interface ImporterTransformerDefinitionBase {
  transformer: ImporterTransformerType;
}

export interface CustomTransformerDefinition
  extends ImporterTransformerDefinitionBase {
  key: string;
  transformFn: (
    value: ImporterOutputFieldType
  ) => ImporterOutputFieldType | undefined;
}
