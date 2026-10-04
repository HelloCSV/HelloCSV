import { ImporterOutputFieldType } from '../../types';
import {
  CustomTransformerDefinition,
  ImporterTransformerOutput,
} from '../types';
import { Transformer } from './base';

export class CustomTransformer extends Transformer {
  key: string;

  parse: (value: ImporterOutputFieldType) => ImporterTransformerOutput;

  constructor(definition: CustomTransformerDefinition) {
    super(definition);
    const { key, transformFn } = definition;
    this.key = key;
    this.parse = transformFn;
  }
}
