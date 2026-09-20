import { RefObject } from 'preact/compat';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslations } from '../../i18';
import { buildMonthMatrix, dayIsOutOfRange } from '../dateUtils';
import { CalendarView as View } from './useDatePickerState';

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

interface Props {
  view: View;
  viewMonth: Dayjs;
  draft: Dayjs | null;
  minBound: Dayjs | null;
  maxBound: Dayjs | null;
  dayRefs: RefObject<Record<string, HTMLButtonElement | null>>;
  onPrev: () => void;
  onNext: () => void;
  onTitleClick: () => void;
  onSelectDay: (day: Dayjs) => void;
  onSelectMonth: (monthIndex: number) => void;
  onSelectYear: (year: number) => void;
  onDayKeyDown: (e: KeyboardEvent, day: Dayjs) => void;
}

export default function CalendarView({
  view,
  viewMonth,
  draft,
  minBound,
  maxBound,
  dayRefs,
  onPrev,
  onNext,
  onTitleClick,
  onSelectDay,
  onSelectMonth,
  onSelectYear,
  onDayKeyDown,
}: Props) {
  const { t } = useTranslations();

  const decadeStart = Math.floor(viewMonth.year() / 10) * 10;
  const matrix = buildMonthMatrix(viewMonth);
  const today = dayjs();
  // Roving tabindex: the selected day (or the 1st of the month) is the tab stop.
  const rovingDay = draft ?? viewMonth.startOf('month');

  const titleText =
    view === 'days'
      ? viewMonth.format('MMMM YYYY')
      : view === 'months'
        ? viewMonth.format('YYYY')
        : `${decadeStart} - ${decadeStart + 9}`;

  return (
    <div className="w-56">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label={t('components.datePicker.previous')}
          onMouseDown={(e) => e.preventDefault()}
          onClick={onPrev}
          className="text-hello-csv-text-muted hover:text-hello-csv-text hover:bg-hello-csv-muted cursor-pointer rounded p-1"
        >
          <ChevronLeftIcon aria-hidden="true" className="size-5" />
        </button>
        <button
          type="button"
          aria-live="polite"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onTitleClick}
          className="text-hello-csv-text hover:bg-hello-csv-muted cursor-pointer rounded px-2 py-1 font-semibold"
        >
          {titleText}
        </button>
        <button
          type="button"
          aria-label={t('components.datePicker.next')}
          onMouseDown={(e) => e.preventDefault()}
          onClick={onNext}
          className="text-hello-csv-text-muted hover:text-hello-csv-text hover:bg-hello-csv-muted cursor-pointer rounded p-1"
        >
          <ChevronRightIcon aria-hidden="true" className="size-5" />
        </button>
      </div>

      {view === 'days' && (
        <div role="grid" aria-label={t('components.datePicker.calendarLabel')}>
          <div role="row" className="mb-1 grid grid-cols-7">
            {WEEKDAY_KEYS.map((key) => (
              <div
                key={key}
                role="columnheader"
                className="text-hello-csv-text-subtle flex h-8 w-8 items-center justify-center text-xs font-medium"
              >
                {t(`components.datePicker.weekdays.${key}`)}
              </div>
            ))}
          </div>
          {matrix.map((week) => (
            <div
              role="row"
              key={week[0].format('YYYY-MM-DD')}
              className="grid grid-cols-7"
            >
              {week.map((day) => {
                const dayKey = day.format('YYYY-MM-DD');
                const isSelected = draft != null && day.isSame(draft, 'day');
                const isToday = day.isSame(today, 'day');
                const isOutsideMonth = !day.isSame(viewMonth, 'month');
                const isDisabled = dayIsOutOfRange(day, minBound, maxBound);
                const isRoving = day.isSame(rovingDay, 'day');

                return (
                  <div role="gridcell" key={dayKey}>
                    <button
                      type="button"
                      ref={(el) => {
                        if (dayRefs.current) dayRefs.current[dayKey] = el;
                      }}
                      tabIndex={isRoving ? 0 : -1}
                      disabled={isDisabled}
                      aria-label={day.format('dddd, MMMM D, YYYY')}
                      aria-selected={isSelected}
                      aria-current={isToday ? 'date' : undefined}
                      onClick={() => onSelectDay(day)}
                      onKeyDown={(e: KeyboardEvent) => onDayKeyDown(e, day)}
                      className={`flex h-8 w-8 items-center justify-center rounded text-sm ${
                        isSelected
                          ? 'bg-hello-csv-primary text-hello-csv-primary-contrast cursor-pointer'
                          : isDisabled
                            ? 'text-hello-csv-text-subtle cursor-not-allowed opacity-50'
                            : isOutsideMonth
                              ? 'text-hello-csv-text-subtle hover:bg-hello-csv-muted cursor-pointer'
                              : 'text-hello-csv-text hover:bg-hello-csv-muted cursor-pointer'
                      } ${isToday && !isSelected ? 'ring-hello-csv-primary ring-1' : ''}`}
                    >
                      {day.date()}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {view === 'months' && (
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 12 }, (_, m) => {
            const isCurrent = m === viewMonth.month();
            return (
              <button
                key={m}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelectMonth(m)}
                className={`cursor-pointer rounded px-2 py-2 text-sm ${
                  isCurrent
                    ? 'bg-hello-csv-primary text-hello-csv-primary-contrast'
                    : 'text-hello-csv-text hover:bg-hello-csv-muted'
                }`}
              >
                {dayjs().month(m).format('MMM')}
              </button>
            );
          })}
        </div>
      )}

      {view === 'years' && (
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 12 }, (_, i) => {
            const year = decadeStart - 1 + i;
            const isCurrent = year === viewMonth.year();
            const isOutside = year < decadeStart || year > decadeStart + 9;
            return (
              <button
                key={year}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelectYear(year)}
                className={`cursor-pointer rounded px-2 py-2 text-sm ${
                  isCurrent
                    ? 'bg-hello-csv-primary text-hello-csv-primary-contrast'
                    : isOutside
                      ? 'text-hello-csv-text-subtle hover:bg-hello-csv-muted'
                      : 'text-hello-csv-text hover:bg-hello-csv-muted'
                }`}
              >
                {year}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
