import { ImporterOutputFieldType } from '../../types';
import {
  ImporterTransformerDefinitionBase,
  ImporterTransformerOutput,
} from '../types';

export class Transformer {
  definition: ImporterTransformerDefinitionBase;

  constructor(definition: ImporterTransformerDefinitionBase) {
    this.definition = definition;
  }

  async transform(
    value: ImporterOutputFieldType
  ): Promise<ImporterOutputFieldType> {
    const newValue = await this.parse(value);
    if (newValue != null) return newValue;
    return value;
  }

  parse(_value: ImporterOutputFieldType): ImporterTransformerOutput {
    throw new Error('Not Implemented');
  }
}
