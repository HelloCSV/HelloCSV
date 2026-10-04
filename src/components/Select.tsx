import {
  Combobox,
  ComboboxButton,
  ComboboxOption,
  ComboboxOptions,
  ComboboxInput,
} from '@headlessui/react';
import {
  ChevronUpDownIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/20/solid';
import { useTranslations } from '../i18';
import { useEffect, useRef, useState } from 'preact/hooks';
import { ReactNode } from 'preact/compat';
import { PASSWORD_MANAGER_IGNORE_PROPS } from '../constants';
import { resolveSingleSelectChange } from './selectChange';

export interface SelectOption<T> {
  label: string;
  value: T;
  icon?: ReactNode;
  group?: string;
}

interface Props<T> {
  value: T[] | T | null;
  options: SelectOption<T>[];
  onChange: (value: T[] | T | null) => void;
  onClose?: () => void;
  multiple?: boolean;
  compareFunction?: (a: T, b: T) => boolean;
  clearable?: boolean;
  searchable?: boolean;
  placeholder?: string;
  classes?: string;
  displayPlaceholderWhenSelected?: boolean;
  autoFocus?: boolean;
  /** Open the dropdown as soon as the input is focused (used for grid editing). */
  immediate?: boolean;
  /**
   * Treat the input purely as a search/filter box: it shows the typed query
   * (not the selected value's label), so clearing it only clears the filter and
   * never the selection. Used for grid editing.
   */
  searchInputAsFilter?: boolean;
  'aria-label'?: string;
}

export default function Select<T>({
  value,
  options,
  onChange,
  onClose,
  multiple = false,
  compareFunction = (a, b) => a === b,
  clearable = false,
  searchable = false,
  placeholder,
  classes,
  displayPlaceholderWhenSelected = false,
  autoFocus = false,
  immediate = false,
  searchInputAsFilter = false,
  ...props
}: Props<T>) {
  const { t } = useTranslations();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on mount (more reliable than the autoFocus attribute across remounts).
  // Combined with `immediate`, this opens the dropdown when grid editing starts.
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isSelected = (valueToCheck: T) => {
    if (multiple && Array.isArray(value)) {
      return value.some((selected) => compareFunction(selected, valueToCheck));
    }
    return compareFunction(value as T, valueToCheck);
  };

  const handleChange = (selected: T | T[]) => {
    setQuery('');
    if (multiple) {
      const selectedArray = Array.isArray(selected) ? selected : [selected];
      onChange(selectedArray);
      return;
    }

    const decision = resolveSingleSelectChange(
      (selected ?? null) as T | null,
      value as T | null | undefined,
      { searchInputAsFilter, compareFunction }
    );
    if (decision.type === 'change') {
      onChange(decision.value);
    }
  };

  const clear = () => {
    setQuery('');
    if (multiple) {
      onChange([]);
    } else {
      onChange(null);
    }
  };

  const selectedOptions = options.filter((option) => isSelected(option.value));
  const baseDisplayValue = selectedOptions.map((o) => o.label).join(', ');

  const filteredOptions =
    query && searchable
      ? options.filter((option) =>
          String(option.label).toLowerCase().includes(query.toLowerCase())
        )
      : options;

  const placeholderValue =
    placeholder ?? t('components.select.optionPlaceholder');

  const getDisplayValue = () => {
    if (searchInputAsFilter) {
      return query;
    }
    if (searchable) {
      return baseDisplayValue;
    }
    if (selectedOptions.length > 0) {
      return displayPlaceholderWhenSelected
        ? `${placeholderValue}: ${baseDisplayValue}`
        : baseDisplayValue;
    }
    return '';
  };

  const hasGroupProperty = filteredOptions.some((option) => option.group);

  const groupedOptions = hasGroupProperty
    ? Object.entries(
        filteredOptions.reduce(
          (acc: Record<string, SelectOption<T>[]>, option) => {
            const groupKey = option.group || 'ungrouped';
            acc[groupKey] = acc[groupKey] || [];
            acc[groupKey].push(option);
            return acc;
          },
          {}
        )
      ).map(([group, items]) => ({
        label: group,
        items,
      }))
    : [{ label: null, items: filteredOptions }];

  const hasNoOptions = groupedOptions.every(({ items }) => items.length === 0);

  const clearButtonDisplayed = searchInputAsFilter
    ? query.length > 0
    : clearable && selectedOptions.length > 0;

  const handleClearButton = () => {
    if (searchInputAsFilter) {
      setQuery('');
      if (inputRef.current) inputRef.current.value = '';
      inputRef.current?.focus();
    } else {
      clear();
    }
  };

  return (
    <Combobox
      value={(value ?? (multiple ? [] : null)) as any}
      onChange={handleChange}
      onClose={onClose}
      multiple={multiple}
      immediate={immediate}
    >
      <div className="hc:relative">
        <ComboboxButton
          className="hc:w-full"
          aria-label={props['aria-label'] ?? placeholder}
        >
          <ComboboxInput
            {...PASSWORD_MANAGER_IGNORE_PROPS}
            ref={inputRef}
            className={`${classes} hc:focus:outline-hello-csv-primary hc:bg-hello-csv-surface hc:block hc:w-full hc:cursor-pointer hc:truncate hc:rounded-md hc:py-1.5 hc:focus:cursor-text ${clearButtonDisplayed ? 'hc:pr-12' : 'hc:pr-2'} hc:text-hello-csv-text hc:outline-hello-csv-border-strong hc:pl-3 hc:text-left hc:outline-1 hc:-outline-offset-1 hc:focus:outline-2 hc:focus:-outline-offset-2 hc:sm:text-sm`}
            displayValue={getDisplayValue}
            onChange={(event) =>
              searchable && setQuery((event.target as HTMLInputElement).value)
            }
            placeholder={placeholderValue}
            readOnly={!searchable}
          />
        </ComboboxButton>

        {clearButtonDisplayed && (
          <span
            role="button"
            tabIndex={0}
            aria-label={t('components.select.clear')}
            // Prevent the input from blurring and headlessui's outside-click
            // handler from firing — both would close the dropdown and (in grid
            // editing) exit edit mode. We only want to clear.
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleClearButton();
            }}
            className="hc:text-hello-csv-text-muted hc:hover:text-hello-csv-text hc:absolute hc:inset-y-0 hc:right-6 hc:flex hc:cursor-pointer hc:items-center"
          >
            <XMarkIcon
              className="hc:text-hello-csv-text-muted hc:hover:text-hello-csv-text hc:h-5 hc:w-5"
              aria-hidden="true"
            />
          </span>
        )}
        <ComboboxButton className="hc:absolute hc:inset-y-0 hc:right-0 hc:flex hc:cursor-pointer hc:items-center hc:pr-2">
          <ChevronUpDownIcon
            aria-hidden="true"
            className="hc:text-hello-csv-text-muted hc:col-start-1 hc:row-start-1 hc:size-5 hc:self-center hc:justify-self-end hc:sm:size-4"
          />
        </ComboboxButton>

        <ComboboxOptions
          anchor="bottom"
          transition
          className="hc:bg-hello-csv-surface-raised hc:ring-hello-csv-border hc:absolute hc:z-99 hc:mt-1 hc:max-h-60 hc:w-[var(--input-width)] hc:overflow-auto hc:rounded-md hc:py-1 hc:text-base hc:ring-1 hc:shadow-lg hc:focus:outline-hidden hc:data-leave:transition hc:data-leave:duration-100 hc:data-leave:ease-in hc:data-closed:data-leave:opacity-0 hc:sm:text-sm"
        >
          {hasNoOptions && (
            <ComboboxOption
              key="no-options"
              disabled
              value={null}
              className="hc:text-hello-csv-text-subtle hc:pointer-events-none hc:relative hc:flex hc:items-center hc:justify-center hc:py-2 hc:pr-9 hc:pl-3 hc:select-none"
            >
              <span className="hc:block hc:truncate hc:font-normal">
                {t('components.select.noOptions')}
              </span>
            </ComboboxOption>
          )}
          {groupedOptions.map(({ label, items }) => (
            <div key={`${label || 'all'}:${query}`}>
              {label && (
                <div className="hc:text-hello-csv-text-subtle hc:py-2 hc:pr-9 hc:pl-3 hc:uppercase">
                  {label}
                </div>
              )}
              {items.map((option) => (
                <ComboboxOption
                  key={
                    typeof option.value === 'object'
                      ? JSON.stringify(option.value)
                      : String(option.value)
                  }
                  value={option.value}
                  // Drive the highlight from headlessui's render state (`focus`)
                  // rather than the `data-focus` attribute + Tailwind variant:
                  // under preact/compat the attribute isn't reliably cleared from
                  // the previously-active option while re-filtering, which left two
                  // options highlighted at once.
                  className={({ focus }) =>
                    `hc:cursor-default hc:items-center hc:py-2 hc:pr-9 hc:pl-3 hc:outline-hidden hc:select-none hc:relative hc:flex ${
                      focus
                        ? 'hc:bg-hello-csv-primary hc:text-hello-csv-primary-contrast'
                        : 'hc:text-hello-csv-text'
                    }`
                  }
                >
                  {({ focus, selected }) => (
                    <>
                      {option.icon}

                      <span
                        className={`hc:block hc:truncate ${selected ? 'hc:font-semibold' : 'hc:font-normal'}`}
                      >
                        {option.label}
                      </span>

                      {selected && (
                        <span
                          className={`hc:absolute hc:inset-y-0 hc:right-0 hc:flex hc:items-center hc:pr-4 ${
                            focus
                              ? 'hc:text-hello-csv-primary-contrast'
                              : 'hc:text-hello-csv-primary'
                          }`}
                        >
                          <CheckIcon
                            aria-hidden="true"
                            className="hc:h-5 hc:w-5"
                          />
                        </span>
                      )}
                    </>
                  )}
                </ComboboxOption>
              ))}
            </div>
          ))}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
