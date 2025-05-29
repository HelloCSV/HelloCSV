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
      <div className="grid grid-cols-1">
        <input
          aria-label={props['aria-label']}
          ref={ref}
          type={type}
          inputMode={type === 'number' ? 'numeric' : 'text'}
          placeholder={placeholder}
          value={localValue}
          onChange={(e) =>
            onChange?.(getParsedValue(e)) ?? setLocalValue(getParsedValue(e))
          }
          className={`${classes} ${iconBuilder != null ? 'pl-10' : ''} ${clearable ? 'pr-10' : ''} focus:outline-hello-csv-primary col-start-1 row-start-1 block rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6`}
          onBlur={(e) => onBlur?.(getParsedValue(e))}
        />
        {iconBuilder?.({
          'aria-hidden': 'true',
          className:
            'pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-gray-400 sm:size-4',
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
            className="col-end-2 row-start-1 flex cursor-pointer items-center justify-self-end pr-2"
          >
            <XMarkIcon
              className="h-5 w-5 text-gray-500 hover:text-gray-700"
              aria-hidden="true"
            />
          </span>
        )}
      </div>
    );
  }
);

export default Input;
