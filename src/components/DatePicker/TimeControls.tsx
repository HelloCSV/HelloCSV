import { Dayjs } from 'dayjs';
import { useTranslations } from '../../i18';
import { PASSWORD_MANAGER_IGNORE_PROPS } from '../../constants';

interface Props {
  draft: Dayjs | null;
  is12h: boolean;
  showSeconds: boolean;
  hasCalendar: boolean;
  meridiem: 'AM' | 'PM';
  hourFieldValue: number;
  onHourChange: (raw: string) => void;
  onPartChange: (part: 'minute' | 'second', raw: string) => void;
  onMeridiem: (next: 'AM' | 'PM') => void;
}

export default function TimeControls({
  draft,
  is12h,
  showSeconds,
  hasCalendar,
  meridiem,
  hourFieldValue,
  onHourChange,
  onPartChange,
  onMeridiem,
}: Props) {
  const { t } = useTranslations();

  return (
    <div
      className={`flex items-end gap-2 ${hasCalendar ? 'border-hello-csv-border mt-3 border-t pt-3' : ''}`}
    >
      <TimeField
        label={t('components.datePicker.hours')}
        min={is12h ? 1 : 0}
        max={is12h ? 12 : 23}
        value={hourFieldValue}
        onChange={onHourChange}
      />
      <span className="text-hello-csv-text pb-1.5">:</span>
      <TimeField
        label={t('components.datePicker.minutes')}
        max={59}
        value={draft?.minute() ?? 0}
        onChange={(v) => onPartChange('minute', v)}
      />
      {showSeconds && (
        <>
          <span className="text-hello-csv-text pb-1.5">:</span>
          <TimeField
            label={t('components.datePicker.seconds')}
            max={59}
            value={draft?.second() ?? 0}
            onChange={(v) => onPartChange('second', v)}
          />
        </>
      )}
      {is12h && (
        <div className="ring-hello-csv-border-strong ml-1 flex overflow-hidden rounded-md ring-1">
          {(['AM', 'PM'] as const).map((m, i) => (
            <button
              key={m}
              type="button"
              aria-pressed={meridiem === m}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onMeridiem(m)}
              className={`cursor-pointer px-2 py-1 text-sm ${
                i === 1 ? 'border-hello-csv-border-strong border-l' : ''
              } ${
                meridiem === m
                  ? 'bg-hello-csv-primary text-hello-csv-primary-contrast'
                  : 'text-hello-csv-text hover:bg-hello-csv-muted'
              }`}
            >
              {t(`components.datePicker.${m === 'AM' ? 'am' : 'pm'}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface TimeFieldProps {
  label: string;
  value: number;
  max: number;
  min?: number;
  onChange: (value: string) => void;
}

function TimeField({ label, value, max, min = 0, onChange }: TimeFieldProps) {
  return (
    <label className="flex flex-col text-xs">
      <span className="text-hello-csv-text-subtle mb-1">{label}</span>
      <input
        {...PASSWORD_MANAGER_IGNORE_PROPS}
        type="number"
        min={min}
        max={max}
        aria-label={label}
        value={String(value).padStart(2, '0')}
        onInput={(e) => onChange((e.target as HTMLInputElement).value)}
        className="focus:outline-hello-csv-primary bg-hello-csv-surface text-hello-csv-text outline-hello-csv-border-strong w-14 rounded-md px-2 py-1 text-center text-sm outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2"
      />
    </label>
  );
}
