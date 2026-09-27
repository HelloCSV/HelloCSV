import { CalendarDaysIcon, ClockIcon } from '@heroicons/react/20/solid';
import { useEffect, useRef } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import { DateColumnType, HourFormat } from '../../types';
import {
  ROOT_CLASS,
  DATE_PICKER_PANEL_ATTR,
  PASSWORD_MANAGER_IGNORE_PROPS,
} from '../../constants';
import { useTranslations } from '../../i18';
import Button from '../Button';
import { useDatePickerState } from './useDatePickerState';
import { usePopoverPosition } from './usePopoverPosition';
import CalendarView from './CalendarView';
import TimeControls from './TimeControls';

export interface DatePickerProps {
  /** Stored value in the column's output format ('' when empty). */
  value: string;
  mode: DateColumnType;
  outputFormat?: string;
  displayFormat?: string;
  min?: string;
  max?: string;
  showSeconds?: boolean;
  hourFormat?: HourFormat;
  /** Fires with the normalized stored string on Enter / calendar pick / Done. */
  onCommit: (storedValue: string) => void;
  /** Initial character when editing started by typing (type-to-edit). */
  seedText?: string;
  'aria-label'?: string;
}

const INPUT_CLASSES =
  'hc:focus:outline-hello-csv-primary hc:bg-hello-csv-surface hc:text-hello-csv-text hc:outline-hello-csv-border-strong hc:placeholder:text-hello-csv-text-subtle hc:block hc:w-full hc:rounded-md hc:py-1.5 hc:pr-10 hc:pl-3 hc:text-base hc:outline-1 hc:-outline-offset-1 hc:focus:outline-2 hc:focus:-outline-offset-2 hc:sm:text-sm/6';

export default function DatePicker({
  value,
  mode,
  outputFormat,
  displayFormat,
  min,
  max,
  showSeconds = false,
  hourFormat = '12h',
  onCommit,
  seedText,
  ...props
}: DatePickerProps) {
  const { t } = useTranslations();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const state = useDatePickerState({
    value,
    mode,
    outputFormat,
    displayFormat,
    min,
    max,
    showSeconds,
    hourFormat,
    onCommit,
    seedText,
    dayRefs,
  });
  const { open, setOpen, hasCalendar, hasTime, commitTextRef } = state;

  const pos = usePopoverPosition({
    open,
    inputRef,
    panelRef,
    onScrollAway: () => commitTextRef.current(),
  });

  // Self-focus on mount (more reliable than the autoFocus attr across remounts).
  useEffect(() => {
    inputRef.current?.focus();
    // Place the cursor at the end so type-to-edit seeding continues naturally.
    const len = inputRef.current?.value.length ?? 0;
    inputRef.current?.setSelectionRange(len, len);
  }, []);

  // Commit when focus leaves the whole picker. The panel is portaled to <body>,
  // so the trigger (container) and the panel are separate DOM subtrees; a
  // document-level `focusout` catches focus moving out of either one.
  useEffect(() => {
    const inWidget = (n: Node | null) =>
      !!n &&
      (!!containerRef.current?.contains(n) || !!panelRef.current?.contains(n));

    const onFocusOut = (e: FocusEvent) => {
      // Only react when focus was inside the picker and is leaving it entirely.
      if (!inWidget(e.target as Node | null)) return;
      if (inWidget(e.relatedTarget as Node | null)) return;
      commitTextRef.current();
    };

    document.addEventListener('focusout', onFocusOut);
    return () => document.removeEventListener('focusout', onFocusOut);
  }, [commitTextRef]);

  return (
    <div ref={containerRef} className="hc:relative hc:w-full">
      <div className="hc:relative">
        <input
          {...PASSWORD_MANAGER_IGNORE_PROPS}
          ref={inputRef}
          aria-label={props['aria-label']}
          type="text"
          className={INPUT_CLASSES}
          value={state.text}
          onInput={state.handleInput}
          onKeyDown={state.handleInputKeyDown}
        />
        <button
          type="button"
          aria-label={t('components.datePicker.pickerLabel')}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="hc:text-hello-csv-text-muted hc:hover:text-hello-csv-text hc:absolute hc:inset-y-0 hc:right-0 hc:flex hc:cursor-pointer hc:items-center hc:pr-2 hc:outline-hidden"
        >
          {hasTime && !hasCalendar ? (
            <ClockIcon aria-hidden="true" className="hc:size-5 hc:sm:size-4" />
          ) : (
            <CalendarDaysIcon
              aria-hidden="true"
              className="hc:size-5 hc:sm:size-4"
            />
          )}
        </button>
      </div>

      {open &&
        createPortal(
          // Portaled out of the grid so the popover escapes the scroll
          // container's overflow clipping and the editing cell's stacking
          // context. The wrapper carries ROOT_CLASS (`hello-csv`) because the
          // library's Tailwind utilities are scoped under it — without a
          // `.hello-csv` ancestor the panel would render unstyled (the theme
          // CSS variables live on <html>, so those resolve regardless). This
          // mirrors how Root.tsx styles the headlessui portal root.
          <div className={ROOT_CLASS}>
            <div
              ref={panelRef}
              {...{ [DATE_PICKER_PANEL_ATTR]: '' }}
              // Clicking non-interactive chrome (whitespace, labels) would blur
              // the focused control to <body>, which the focusout handler reads
              // as "left the picker" and commits/closes. Prevent those clicks
              // from moving focus; real controls still focus normally.
              onMouseDown={(e: MouseEvent) => {
                const target = e.target as HTMLElement;
                if (!target.closest('input, button, select, textarea')) {
                  e.preventDefault();
                }
              }}
              onKeyDown={(e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                  e.stopPropagation();
                  setOpen(false);
                  inputRef.current?.focus();
                }
              }}
              style={{ position: 'absolute', top: pos.top, left: pos.left }}
              className="hc:bg-hello-csv-surface-raised hc:ring-hello-csv-border hc:z-99 hc:w-max hc:rounded-md hc:p-3 hc:text-base hc:ring-1 hc:shadow-lg hc:focus:outline-hidden hc:sm:text-sm"
              role="dialog"
              aria-label={t('components.datePicker.pickerLabel')}
            >
              {hasCalendar && (
                <CalendarView
                  view={state.view}
                  viewMonth={state.viewMonth}
                  draft={state.draft}
                  minBound={state.minBound}
                  maxBound={state.maxBound}
                  dayRefs={dayRefs}
                  onPrev={state.handlePrev}
                  onNext={state.handleNext}
                  onTitleClick={state.handleTitleClick}
                  onSelectDay={state.selectDay}
                  onSelectMonth={state.selectMonth}
                  onSelectYear={state.selectYear}
                  onDayKeyDown={state.handleGridKeyDown}
                />
              )}

              {hasTime && (
                <TimeControls
                  draft={state.draft}
                  is12h={state.is12h}
                  showSeconds={showSeconds}
                  hasCalendar={hasCalendar}
                  meridiem={state.meridiem}
                  hourFieldValue={state.hourFieldValue}
                  onHourChange={state.setHour}
                  onPartChange={state.setTimePart}
                  onMeridiem={state.setMeridiem}
                />
              )}

              <div className="hc:mt-3 hc:flex hc:justify-end">
                <Button variant="primary" onClick={state.commitText}>
                  {t('components.datePicker.done')}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
