import { ImporterOutputFieldType, ProcessingPhase } from '../types';

export type ImporterTransformerBaseOutput = ImporterOutputFieldType | undefined;

export type ImporterTransformerOutput =
  | ImporterTransformerBaseOutput
  | Promise<ImporterTransformerBaseOutput>;

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
  runOn?: ProcessingPhase;
}

export interface CustomTransformerDefinition
  extends ImporterTransformerDefinitionBase {
  key: string;
  transformFn: (value: ImporterOutputFieldType) => ImporterTransformerOutput;
}

export interface ApplyTransformationsOptions {
  phase?: ProcessingPhase;
  concurrency?: number;
}
