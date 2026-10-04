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
      className={`hc:flex hc:items-end hc:gap-2 ${hasCalendar ? 'hc:border-hello-csv-border hc:mt-3 hc:border-t hc:pt-3' : ''}`}
    >
      <TimeField
        label={t('components.datePicker.hours')}
        min={is12h ? 1 : 0}
        max={is12h ? 12 : 23}
        value={hourFieldValue}
        onChange={onHourChange}
      />
      <span className="hc:text-hello-csv-text hc:pb-1.5">:</span>
      <TimeField
        label={t('components.datePicker.minutes')}
        max={59}
        value={draft?.minute() ?? 0}
        onChange={(v) => onPartChange('minute', v)}
      />
      {showSeconds && (
        <>
          <span className="hc:text-hello-csv-text hc:pb-1.5">:</span>
          <TimeField
            label={t('components.datePicker.seconds')}
            max={59}
            value={draft?.second() ?? 0}
            onChange={(v) => onPartChange('second', v)}
          />
        </>
      )}
      {is12h && (
        <div className="hc:ring-hello-csv-border-strong hc:ml-1 hc:flex hc:overflow-hidden hc:rounded-md hc:ring-1">
          {(['AM', 'PM'] as const).map((m, i) => (
            <button
              key={m}
              type="button"
              aria-pressed={meridiem === m}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onMeridiem(m)}
              className={`hc:cursor-pointer hc:px-2 hc:py-1 hc:text-sm ${
                i === 1 ? 'hc:border-hello-csv-border-strong hc:border-l' : ''
              } ${
                meridiem === m
                  ? 'hc:bg-hello-csv-primary hc:text-hello-csv-primary-contrast'
                  : 'hc:text-hello-csv-text hc:hover:bg-hello-csv-muted'
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
    <label className="hc:flex hc:flex-col hc:text-xs">
      <span className="hc:text-hello-csv-text-subtle hc:mb-1">{label}</span>
      <input
        {...PASSWORD_MANAGER_IGNORE_PROPS}
        type="number"
        min={min}
        max={max}
        aria-label={label}
        value={String(value).padStart(2, '0')}
        onInput={(e) => onChange((e.target as HTMLInputElement).value)}
        className="hc:focus:outline-hello-csv-primary hc:bg-hello-csv-surface hc:text-hello-csv-text hc:outline-hello-csv-border-strong hc:w-14 hc:rounded-md hc:px-2 hc:py-1 hc:text-center hc:text-sm hc:outline-1 hc:-outline-offset-1 hc:focus:outline-2 hc:focus:-outline-offset-2"
      />
    </label>
  );
}
