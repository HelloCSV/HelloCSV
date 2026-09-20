import {
  DateColumnType,
  DateValidatorDefinition,
  ImporterOutputFieldType,
} from '../../types';
import { isEmptyCell } from '../../utils';
import { parseDate, valueIsOutOfRange } from '@/components/dateUtils';
import { Validator } from './base';

/**
 * Automatic validator for `date` / `datetime` / `time` columns. Coercion (see
 * src/sheet/valueCoercion.ts) normalizes recognized values to the output
 * format, so a valid cell re-parses cleanly; anything that failed to coerce is
 * kept verbatim and flagged here. Empty is valid — presence is `required`'s job.
 */
export class DateValidator extends Validator {
  dateType: DateColumnType;

  typeArguments: {
    outputFormat?: string;
    displayFormat?: string;
    showSeconds?: boolean;
  };

  min?: string;

  max?: string;

  constructor(definition: DateValidatorDefinition) {
    super(definition);
    this.dateType = definition.dateType;
    this.typeArguments = {
      outputFormat: definition.outputFormat,
      displayFormat: definition.displayFormat,
      showSeconds: definition.showSeconds,
    };
    this.min = definition.min;
    this.max = definition.max;
  }

  isValid(fieldValue: ImporterOutputFieldType) {
    if (isEmptyCell(fieldValue)) {
      return;
    }

    if (typeof fieldValue !== 'string') {
      return this.definition.error || `validators.${this.dateType}`;
    }

    const parsed = parseDate(fieldValue, this.dateType, this.typeArguments);
    if (!parsed) {
      return this.definition.error || `validators.${this.dateType}`;
    }

    const min = parseDate(this.min, this.dateType, this.typeArguments);
    const max = parseDate(this.max, this.dateType, this.typeArguments);
    if (valueIsOutOfRange(parsed, min, max)) {
      return this.definition.error || 'validators.dateOutOfRange';
    }
  }
}
