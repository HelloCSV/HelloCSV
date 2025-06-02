import { ImporterOutputFieldType } from '../../types';
import { ImporterTransformerDefinitionBase } from '../types';

export class Transformer {
  definition: ImporterTransformerDefinitionBase;

  constructor(definition: ImporterTransformerDefinitionBase) {
    this.definition = definition;
  }

  transform(value: ImporterOutputFieldType): ImporterOutputFieldType {
    const newValue = this.parse(value);
    if (newValue != null) return newValue;
    return value;
  }

  parse(_value: ImporterOutputFieldType): ImporterOutputFieldType | undefined {
    throw new Error('Not Implemented');
  }
}
