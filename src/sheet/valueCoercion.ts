import { ImporterOutputFieldType } from '@/types';
import { SheetColumnDefinition } from './types';
import { DEFAULT_TRUE_TOKENS, DEFAULT_FALSE_TOKENS } from '@/constants';
import { coerceDateValue } from '@/components/dateUtils';

// Numbers only within the safe-integer float range are treated as numeric; this
// mirrors the previous CSV-mapping behavior (avoids turning huge/ID-like strings
// into lossy floats).
const FLOAT = /^\s*-?(\d+\.?|\.\d+|\d+\.\d+)([eE][-+]?\d+)?\s*$/;
const MAX_FLOAT = Math.pow(2, 53);
const MIN_FLOAT = -MAX_FLOAT;

function isFloat(value: string): boolean {
  if (FLOAT.test(value)) {
    const num = parseFloat(value);
    return num > MIN_FLOAT && num < MAX_FLOAT;
  }
  return false;
}

function coerceBoolean(
  raw: string,
  typeArguments: {
    trueLabel?: string;
    falseLabel?: string;
    trueValues?: string[];
    falseValues?: string[];
  } = {}
): ImporterOutputFieldType {
  const token = raw.trim().toLowerCase();

  const trueTokens = [
    ...(typeArguments.trueValues ?? DEFAULT_TRUE_TOKENS),
    ...(typeArguments.trueLabel ? [typeArguments.trueLabel] : []),
  ].map((t) => t.toString().toLowerCase());

  const falseTokens = [
    ...(typeArguments.falseValues ?? DEFAULT_FALSE_TOKENS),
    ...(typeArguments.falseLabel ? [typeArguments.falseLabel] : []),
  ].map((t) => t.toString().toLowerCase());

  if (trueTokens.includes(token)) return true;
  if (falseTokens.includes(token)) return false;
  return raw; // unmatched -> keep raw so validation can flag it
}

function resolveEnumToken(
  token: string,
  values: { label: string; value: string }[]
): string {
  const trimmed = token.trim();

  const byValue = values.find((option) => String(option.value) === trimmed);

  if (byValue) {
    return String(byValue.value);
  }

  const byLabel = values.find((option) => option.label === trimmed);

  if (byLabel) {
    return String(byLabel.value);
  }

  return trimmed; // unmatched -> keep the token so validation can flag it
}

export function coerceCellValue(
  column: SheetColumnDefinition,
  raw: string
): ImporterOutputFieldType {
  switch (column.type) {
    case 'number':
      if (raw.trim() === '') return raw;
      return isFloat(raw) ? parseFloat(raw) : raw;
    case 'boolean':
      return coerceBoolean(raw, column.typeArguments);
    case 'enum': {
      const values = column.typeArguments.values;
      if (column.typeArguments.multiple) {
        const delimiter = column.typeArguments.delimiter ?? ',';
        return raw
          .split(delimiter)
          .map((part) => part.trim())
          .filter((part) => part !== '')
          .map((part) => resolveEnumToken(part, values));
      }
      if (raw.trim() === '') return raw;
      return resolveEnumToken(raw, values);
    }
    case 'date':
    case 'datetime':
    case 'time':
      // Parse against the column's formats and re-emit in the output format
      // (default ISO). Unparseable input is kept verbatim so the automatic
      // date validator can flag it.
      return coerceDateValue(raw, column.type, column.typeArguments);
    default:
      // string / reference / calculated -> raw (reference is sourced from the
      // referenced sheet and calculated is computed elsewhere).
      return raw;
  }
}

/**
 * Serialize a typed cell value back to a string — the inverse of
 * `coerceCellValue`, so a value survives a copy (format) -> paste (coerce)
 * round-trip.
 */
export function formatCellValue(
  column: SheetColumnDefinition,
  value: ImporterOutputFieldType
): string {
  switch (column.type) {
    case 'enum':
      if (column.typeArguments.multiple && Array.isArray(value)) {
        const delimiter = column.typeArguments.delimiter;
        return value.join(typeof delimiter === 'string' ? delimiter : ',');
      }
      return value == null ? '' : String(value);
    case 'boolean': {
      const typeArguments = column.typeArguments ?? {};
      if (value === true) {
        return (
          typeArguments.trueValues?.[0] ?? typeArguments.trueLabel ?? 'true'
        );
      }
      if (value === false) {
        return (
          typeArguments.falseValues?.[0] ?? typeArguments.falseLabel ?? 'false'
        );
      }
      return value == null ? '' : String(value);
    }
    default:
      // string / number / reference / calculated
      return value == null ? '' : String(value);
  }
}

/** The "empty" value appropriate for a column (used when clearing cells). */
export function emptyValueForColumn(
  column: SheetColumnDefinition
): ImporterOutputFieldType {
  if (column.type === 'enum' && column.typeArguments.multiple) {
    return [];
  }
  return '';
}
