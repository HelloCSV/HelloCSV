import { RefObject } from 'preact/compat';
import { useRef, useState } from 'preact/hooks';
import dayjs, { Dayjs } from 'dayjs';
import { DateColumnType, HourFormat } from '@/types';
import {
  defaultDisplayFormat,
  dayIsOutOfRange,
  formatDisplay,
  parseDate,
  toStored,
} from '../dateUtils';

interface Params {
  mode: DateColumnType;
  value: string;
  outputFormat?: string;
  displayFormat?: string;
  min?: string;
  max?: string;
  showSeconds: boolean;
  hourFormat: HourFormat;
  seedText?: string;
  onCommit: (storedValue: string) => void;
  dayRefs: RefObject<Record<string, HTMLButtonElement | null>>;
}

export type CalendarView = 'days' | 'months' | 'years';

/**
 * Owns all DatePicker state (draft value, typed text, visible month, calendar
 * view, open) and the handlers that mutate them. Pure logic — it holds no DOM
 * refs beyond `dayRefs` (needed for roving focus in the calendar grid).
 */
export function useDatePickerState({
  mode,
  value,
  outputFormat,
  displayFormat,
  min,
  max,
  showSeconds,
  hourFormat,
  seedText,
  onCommit,
  dayRefs,
}: Params) {
  const typeArgs = { outputFormat, displayFormat, showSeconds, hourFormat };
  const is12h = hourFormat !== '24h';
  const hasCalendar = mode === 'date' || mode === 'datetime';
  const hasTime = mode === 'time' || mode === 'datetime';

  const initialDraft = parseDate(seedText ?? value, mode, typeArgs);
  const [draft, setDraft] = useState<Dayjs | null>(initialDraft);
  const [text, setText] = useState<string>(
    seedText ?? formatDisplay(value, mode, typeArgs)
  );
  const [viewMonth, setViewMonth] = useState<Dayjs>(
    initialDraft ?? dayjs().startOf('month')
  );
  // Opens as soon as the cell enters edit mode so the picker is immediately
  // usable; a manual state (rather than headlessui's internal-only one) keeps
  // full control over keyboard + focus inside the grid cell.
  const [open, setOpen] = useState(true);
  const [view, setView] = useState<CalendarView>('days');

  const minBound = parseDate(min, mode, typeArgs);
  const maxBound = parseDate(max, mode, typeArgs);

  function displayFor(date: Dayjs): string {
    return date.format(
      displayFormat ?? defaultDisplayFormat(mode, showSeconds, hourFormat)
    );
  }

  /** Commit the current text: empty -> '', parseable -> normalized, else raw. */
  function commitText() {
    const trimmed = text.trim();
    if (trimmed === '') {
      onCommit('');
      return;
    }
    const parsed = parseDate(trimmed, mode, typeArgs);
    onCommit(parsed ? toStored(parsed, mode, typeArgs) : trimmed);
  }
  // Holds the latest commitText so listeners don't re-subscribe every render.
  const commitTextRef = useRef<() => void>(() => {});
  commitTextRef.current = commitText;

  function applyDraft(next: Dayjs, { commit }: { commit: boolean }) {
    setDraft(next);
    setViewMonth(next.startOf('month'));
    setText(displayFor(next));
    if (commit) onCommit(toStored(next, mode, typeArgs));
  }

  function handleInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value;
    setText(raw);
    const parsed = parseDate(raw, mode, typeArgs);
    if (parsed) {
      setDraft(parsed);
      setViewMonth(parsed.startOf('month'));
    }
  }

  function focusDay(day: Dayjs) {
    const key = day.format('YYYY-MM-DD');
    dayRefs.current?.[key]?.focus();
  }

  function handleInputKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      commitText();
    } else if (e.key === 'Escape' && open) {
      // A first Escape closes the panel; a second one bubbles to the cell to
      // exit edit mode.
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    } else if (e.key === 'ArrowDown' && hasCalendar) {
      // Open the calendar and move focus onto the focused/selected day.
      e.preventDefault();
      setOpen(true);
      const target = draft ?? dayjs();
      setViewMonth(target.startOf('month'));
      requestAnimationFrame(() => focusDay(target));
    }
  }

  function selectDay(day: Dayjs) {
    if (dayIsOutOfRange(day, minBound, maxBound)) return;
    // Preserve the current time portion for datetime; date-only for date.
    const base = draft ?? dayjs().startOf('day');
    const next = day
      .hour(base.hour())
      .minute(base.minute())
      .second(base.second());
    // For pure date, selecting commits immediately; datetime waits for the time.
    applyDraft(next, { commit: mode === 'date' });
  }

  function handleGridKeyDown(e: KeyboardEvent, focused: Dayjs) {
    let next: Dayjs | null = null;
    switch (e.key) {
      case 'ArrowLeft':
        next = focused.subtract(1, 'day');
        break;
      case 'ArrowRight':
        next = focused.add(1, 'day');
        break;
      case 'ArrowUp':
        next = focused.subtract(1, 'week');
        break;
      case 'ArrowDown':
        next = focused.add(1, 'week');
        break;
      case 'PageUp':
        next = focused.subtract(1, 'month');
        break;
      case 'PageDown':
        next = focused.add(1, 'month');
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        e.stopPropagation();
        selectDay(focused);
        return;
      default:
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    setViewMonth(next.startOf('month'));
    requestAnimationFrame(() => focusDay(next!));
  }

  function setTimePart(part: 'hour' | 'minute' | 'second', raw: string) {
    const num = Number(raw);
    if (Number.isNaN(num)) return;
    const base = draft ?? dayjs().startOf('day');
    const next = base[part](num);
    setDraft(next);
    setText(displayFor(next));
  }

  const currentHour = draft?.hour() ?? 0;
  const meridiem: 'AM' | 'PM' = currentHour >= 12 ? 'PM' : 'AM';
  // In 12h mode the hours field shows 1-12; 0/12/24 map to 12.
  const hourFieldValue = is12h ? currentHour % 12 || 12 : currentHour;

  function setHour(raw: string) {
    const num = Number(raw);
    if (Number.isNaN(num)) return;
    const base = draft ?? dayjs().startOf('day');
    let hour24 = num;
    if (is12h) {
      const h12 = ((num % 12) + 12) % 12; // 12 -> 0
      hour24 = meridiem === 'PM' ? h12 + 12 : h12;
    }
    const next = base.hour(hour24);
    setDraft(next);
    setText(displayFor(next));
  }

  function setMeridiem(next: 'AM' | 'PM') {
    if (next === meridiem) return;
    const base = draft ?? dayjs().startOf('day');
    const h12 = base.hour() % 12;
    const updated = base.hour(next === 'PM' ? h12 + 12 : h12);
    setDraft(updated);
    setText(displayFor(updated));
  }

  // Header arrows step by the unit of the current view; the title drills out.
  function handlePrev() {
    if (view === 'days') setViewMonth(viewMonth.subtract(1, 'month'));
    else if (view === 'months') setViewMonth(viewMonth.subtract(1, 'year'));
    else setViewMonth(viewMonth.subtract(10, 'year'));
  }
  function handleNext() {
    if (view === 'days') setViewMonth(viewMonth.add(1, 'month'));
    else if (view === 'months') setViewMonth(viewMonth.add(1, 'year'));
    else setViewMonth(viewMonth.add(10, 'year'));
  }
  function handleTitleClick() {
    setView(view === 'days' ? 'months' : 'years');
  }
  function selectMonth(monthIndex: number) {
    setViewMonth(viewMonth.month(monthIndex));
    setView('days');
  }
  function selectYear(year: number) {
    setViewMonth(viewMonth.year(year));
    setView('months');
  }

  return {
    // state
    open,
    setOpen,
    text,
    draft,
    viewMonth,
    view,
    minBound,
    maxBound,
    // derived
    is12h,
    hasCalendar,
    hasTime,
    meridiem,
    hourFieldValue,
    commitTextRef,
    // trigger handlers
    handleInput,
    handleInputKeyDown,
    commitText,
    // calendar handlers
    handlePrev,
    handleNext,
    handleTitleClick,
    selectDay,
    selectMonth,
    selectYear,
    handleGridKeyDown,
    // time handlers
    setHour,
    setTimePart,
    setMeridiem,
  };
}
