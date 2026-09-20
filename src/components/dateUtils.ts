import dayjs, { Dayjs, extend } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {
  DateColumnType,
  HourFormat,
  SheetColumnDateTypeArguments,
} from '@/types';

// Registered once for the whole app — enables strict parsing against explicit
// format strings (e.g. `DD/MM/YYYY`).
extend(customParseFormat);

const ISO_FORMAT: Record<DateColumnType, string> = {
  date: 'YYYY-MM-DD',
  datetime: 'YYYY-MM-DDTHH:mm:ss',
  time: 'HH:mm:ss',
};

function defaultOutputFormat(
  mode: DateColumnType,
  showSeconds = false
): string {
  if (mode === 'date' || showSeconds) return ISO_FORMAT[mode];
  return mode === 'time' ? 'HH:mm' : 'YYYY-MM-DDTHH:mm';
}

export function defaultDisplayFormat(
  mode: DateColumnType,
  showSeconds = false,
  hourFormat: HourFormat = '12h'
): string {
  const clock =
    hourFormat === '24h'
      ? showSeconds
        ? 'HH:mm:ss'
        : 'HH:mm'
      : showSeconds
        ? 'h:mm:ss A'
        : 'h:mm A';
  switch (mode) {
    case 'date':
      return 'MMM D, YYYY';
    case 'time':
      return clock;
    case 'datetime':
      return `MMM D, YYYY ${clock}`;
  }
}

/**
 * The formats a raw value is strictly parsed against. Includes seconds/no-seconds
 * and 12h/24h variants so input parsing is lenient regardless of the column's
 * `showSeconds` / `hourFormat` settings.
 */
function parseFormats(
  mode: DateColumnType,
  typeArguments: SheetColumnDateTypeArguments = {}
): string[] {
  const candidates = [
    typeArguments.outputFormat,
    typeArguments.displayFormat,
    ISO_FORMAT[mode],
    defaultOutputFormat(mode, true),
    defaultOutputFormat(mode, false),
  ];
  for (const hourFormat of ['12h', '24h'] as const) {
    for (const showSeconds of [true, false]) {
      candidates.push(defaultDisplayFormat(mode, showSeconds, hourFormat));
    }
  }
  return candidates.filter((f): f is string => !!f);
}

/**
 * Strictly parse a stored/user value into a dayjs object, trying the column's
 * output/display formats then the ISO fallback. Returns `null` for empty or
 * unparseable input.
 */
export function parseDate(
  value: string | null | undefined,
  mode: DateColumnType,
  typeArguments: SheetColumnDateTypeArguments = {}
): Dayjs | null {
  if (value == null || value.trim() === '') {
    return null;
  }

  const parsed = dayjs(value.trim(), parseFormats(mode, typeArguments), true);

  return parsed.isValid() ? parsed : null;
}

/** Serialize a dayjs object to the column's stored/output format. */
export function toStored(
  date: Dayjs | null,
  mode: DateColumnType,
  typeArguments: SheetColumnDateTypeArguments = {}
): string {
  if (!date || !date.isValid()) {
    return '';
  }

  return date.format(
    typeArguments.outputFormat ??
      defaultOutputFormat(mode, typeArguments.showSeconds)
  );
}

/**
 * Coerce a raw CSV/user string into the normalized stored value. Empty stays
 * empty; a parseable value is normalized to `outputFormat`; anything else is
 * kept verbatim so the automatic validator can flag it.
 */
export function coerceDateValue(
  raw: string,
  mode: DateColumnType,
  typeArguments: SheetColumnDateTypeArguments = {}
): string {
  if (raw.trim() === '') {
    return '';
  }

  const parsed = parseDate(raw, mode, typeArguments);
  return parsed ? toStored(parsed, mode, typeArguments) : raw;
}

/**
 * Format a stored value for display. Unparseable values are returned unchanged
 * so invalid cells remain visible (and flagged).
 */
export function formatDisplay(
  value: string | null | undefined,
  mode: DateColumnType,
  typeArguments: SheetColumnDateTypeArguments = {}
): string {
  if (value == null || value === '') {
    return '';
  }

  const parsed = parseDate(value, mode, typeArguments);
  if (!parsed) {
    return value;
  }

  return parsed.format(
    typeArguments.displayFormat ??
      defaultDisplayFormat(
        mode,
        typeArguments.showSeconds,
        typeArguments.hourFormat
      )
  );
}

/**
 * Build a stable 6×7 matrix of days covering the visible calendar for
 * `viewMonth`, starting on the first day of the week. Always 6 rows so the
 * calendar height doesn't jump between months.
 */
export function buildMonthMatrix(viewMonth: Dayjs): Dayjs[][] {
  const gridStart = viewMonth.startOf('month').startOf('week');
  const weeks: Dayjs[][] = [];
  let cursor = gridStart;
  for (let w = 0; w < 6; w++) {
    const row: Dayjs[] = [];
    for (let d = 0; d < 7; d++) {
      row.push(cursor);
      cursor = cursor.add(1, 'day');
    }
    weeks.push(row);
  }
  return weeks;
}

/**
 * Whether `day` falls outside the inclusive [min, max] range at day
 * granularity — used to disable calendar cells.
 */
export function dayIsOutOfRange(
  day: Dayjs,
  min: Dayjs | null,
  max: Dayjs | null
): boolean {
  if (min && day.isBefore(min, 'day')) return true;
  if (max && day.isAfter(max, 'day')) return true;
  return false;
}

/**
 * Whether `value` falls outside the inclusive [min, max] range at full
 * (millisecond) granularity — used by the validator so datetime/time bounds
 * account for the time portion, not just the day.
 */
export function valueIsOutOfRange(
  value: Dayjs,
  min: Dayjs | null,
  max: Dayjs | null
): boolean {
  if (min && value.isBefore(min)) return true;
  if (max && value.isAfter(max)) return true;
  return false;
}
