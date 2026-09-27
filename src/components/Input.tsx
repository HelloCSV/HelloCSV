import {
  FormEvent,
  forwardRef,
  PropsWithoutRef,
  ReactNode,
  useEffect,
  useState,
} from 'preact/compat';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { ImporterOutputFieldType } from '../types';
import { PASSWORD_MANAGER_IGNORE_PROPS } from '../constants';
import { useTranslations } from '../i18';

interface Props {
  value: ImporterOutputFieldType;
  onBlur?: (value: ImporterOutputFieldType) => void;
  onChange?: (value: ImporterOutputFieldType) => void;
  placeholder?: string;
  iconBuilder?: (props: PropsWithoutRef<ReactNode>) => ReactNode;
  classes?: string;
  clearable?: boolean;
  type?: 'text' | 'number';
  'aria-label'?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(
  (
    {
      value,
      onBlur,
      onChange,
      placeholder,
      iconBuilder,
      classes,
      clearable,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const { t } = useTranslations();
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const displayClearIcon = clearable && value != null && value !== '';

    function getParsedValue(e: FormEvent<HTMLInputElement>) {
      const target = e.target as HTMLInputElement;
      const value = type === 'number' ? target?.valueAsNumber : target?.value;
      const parsedValue =
        typeof value === 'number' && isNaN(value) ? '' : value;

      return parsedValue ?? '';
    }

    return (
      <div className="hc:grid hc:grid-cols-1">
        <input
          {...PASSWORD_MANAGER_IGNORE_PROPS}
          aria-label={props['aria-label']}
          ref={ref}
          type={type}
          inputMode={type === 'number' ? 'numeric' : 'text'}
          placeholder={placeholder}
          value={
            typeof localValue === 'boolean'
              ? localValue.toString()
              : Array.isArray(localValue)
                ? ''
                : (localValue ?? '')
          }
          onChange={(e) =>
            onChange?.(getParsedValue(e)) ?? setLocalValue(getParsedValue(e))
          }
          className={`${classes} ${iconBuilder != null ? 'hc:pl-10' : ''} ${clearable ? 'hc:pr-10' : ''} hc:focus:outline-hello-csv-primary hc:bg-hello-csv-surface hc:text-hello-csv-text hc:outline-hello-csv-border-strong hc:placeholder:text-hello-csv-text-subtle hc:col-start-1 hc:row-start-1 hc:block hc:rounded-md hc:px-3 hc:py-1.5 hc:text-base hc:outline-1 hc:-outline-offset-1 hc:focus:outline-2 hc:focus:-outline-offset-2 hc:sm:text-sm/6`}
          onBlur={(e) => onBlur?.(getParsedValue(e))}
        />
        {iconBuilder?.({
          'aria-hidden': 'true',
          className:
            'hc:pointer-events-none hc:col-start-1 hc:row-start-1 hc:ml-3 hc:size-5 hc:self-center hc:text-hello-csv-text-subtle hc:sm:size-4',
        })}

        {displayClearIcon && (
          <span
            role="button"
            tabIndex={0}
            aria-label={t('components.input.clear')}
            onClick={(e) => {
              e.stopPropagation();
              onChange?.('');
            }}
            className="hc:col-end-2 hc:row-start-1 hc:flex hc:cursor-pointer hc:items-center hc:justify-self-end hc:pr-2"
          >
            <XMarkIcon
              className="hc:text-hello-csv-text-muted hc:hover:text-hello-csv-text hc:h-5 hc:w-5"
              aria-hidden="true"
            />
          </span>
        )}
      </div>
    );
  }
);

export default Input;
