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
      <div className="relative">
        <ComboboxButton
          className="w-full"
          aria-label={props['aria-label'] ?? placeholder}
        >
          <ComboboxInput
            {...PASSWORD_MANAGER_IGNORE_PROPS}
            ref={inputRef}
            className={`${classes} focus:outline-hello-csv-primary bg-hello-csv-surface block w-full cursor-pointer truncate rounded-md py-1.5 focus:cursor-text ${clearButtonDisplayed ? 'pr-12' : 'pr-2'} text-hello-csv-text outline-hello-csv-border-strong pl-3 text-left outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 sm:text-sm`}
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
            className="text-hello-csv-text-muted hover:text-hello-csv-text absolute inset-y-0 right-6 flex cursor-pointer items-center"
          >
            <XMarkIcon
              className="text-hello-csv-text-muted hover:text-hello-csv-text h-5 w-5"
              aria-hidden="true"
            />
          </span>
        )}
        <ComboboxButton className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-2">
          <ChevronUpDownIcon
            aria-hidden="true"
            className="text-hello-csv-text-muted col-start-1 row-start-1 size-5 self-center justify-self-end sm:size-4"
          />
        </ComboboxButton>

        <ComboboxOptions
          anchor="bottom"
          transition
          className="bg-hello-csv-surface-raised ring-hello-csv-border absolute z-99 mt-1 max-h-60 w-[var(--input-width)] overflow-auto rounded-md py-1 text-base ring-1 shadow-lg focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
        >
          {hasNoOptions && (
            <ComboboxOption
              key="no-options"
              disabled
              value={null}
              className="text-hello-csv-text-subtle pointer-events-none relative flex items-center justify-center py-2 pr-9 pl-3 select-none"
            >
              <span className="block truncate font-normal">
                {t('components.select.noOptions')}
              </span>
            </ComboboxOption>
          )}
          {groupedOptions.map(({ label, items }) => (
            <div key={`${label || 'all'}:${query}`}>
              {label && (
                <div className="text-hello-csv-text-subtle py-2 pr-9 pl-3 uppercase">
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
                    `relative flex cursor-default items-center py-2 pr-9 pl-3 outline-hidden select-none ${
                      focus
                        ? 'bg-hello-csv-primary text-hello-csv-primary-contrast'
                        : 'text-hello-csv-text'
                    }`
                  }
                >
                  {({ focus, selected }) => (
                    <>
                      {option.icon}

                      <span
                        className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}
                      >
                        {option.label}
                      </span>

                      {selected && (
                        <span
                          className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                            focus
                              ? 'text-hello-csv-primary-contrast'
                              : 'text-hello-csv-primary'
                          }`}
                        >
                          <CheckIcon aria-hidden="true" className="h-5 w-5" />
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
