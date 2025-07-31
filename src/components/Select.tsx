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
import { useState } from 'preact/hooks';
import { ReactNode } from 'preact/compat';

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
  multiple?: boolean;
  compareFunction?: (a: T, b: T) => boolean;
  clearable?: boolean;
  searchable?: boolean;
  placeholder?: string;
  classes?: string;
  displayPlaceholderWhenSelected?: boolean;
  'aria-label'?: string;
}

export default function Select<T>({
  value,
  options,
  onChange,
  multiple = false,
  compareFunction = (a, b) => a === b,
  clearable = false,
  searchable = false,
  placeholder,
  classes,
  displayPlaceholderWhenSelected = false,
  ...props
}: Props<T>) {
  const { t } = useTranslations();
  const [query, setQuery] = useState('');

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
    } else {
      onChange(selected as T);
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
  const clearButtonDisplayed = clearable && selectedOptions.length > 0;

  return (
    <Combobox value={value as any} onChange={handleChange} multiple={multiple}>
      <div className="relative">
        <ComboboxButton
          className="w-full"
          aria-label={props['aria-label'] ?? placeholder}
        >
          <ComboboxInput
            className={`${classes} focus:outline-hello-csv-primary block w-full cursor-pointer truncate rounded-md bg-white py-1.5 focus:cursor-text ${clearButtonDisplayed ? 'pr-12' : 'pr-2'} pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 sm:text-sm`}
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
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
            className="absolute inset-y-0 right-6 flex cursor-pointer items-center text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon
              className="h-5 w-5 text-gray-500 hover:text-gray-700"
              aria-hidden="true"
            />
          </span>
        )}
        <ComboboxButton className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-2">
          <ChevronUpDownIcon
            aria-hidden="true"
            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
          />
        </ComboboxButton>

        <ComboboxOptions
          anchor="bottom"
          transition
          className="absolute z-99 mt-1 max-h-60 w-[var(--input-width)] overflow-auto rounded-md bg-white py-1 text-base ring-1 shadow-lg ring-black/5 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
        >
          {hasNoOptions && (
            <ComboboxOption
              key="no-options"
              disabled
              value={null}
              className="pointer-events-none relative flex items-center justify-center py-2 pr-9 pl-3 text-gray-400 select-none"
            >
              <span className="block truncate font-normal">
                {t('components.select.noOptions')}
              </span>
            </ComboboxOption>
          )}
          {groupedOptions.map(({ label, items }) => (
            <div key={label || 'all'}>
              {label && (
                <div className="py-2 pr-9 pl-3 text-gray-400 uppercase">
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
                  className="group data-focus:bg-hello-csv-primary relative flex cursor-default items-center py-2 pr-9 pl-3 text-gray-900 select-none data-focus:text-white data-focus:outline-hidden"
                >
                  {option.icon}

                  <span className="block truncate font-normal group-data-selected:font-semibold">
                    {option.label}
                  </span>

                  {isSelected(option.value) && (
                    <span className="text-hello-csv-primary absolute inset-y-0 right-0 flex items-center pr-4 group-data-focus:text-white">
                      <CheckIcon aria-hidden="true" className="h-5 w-5" />
                    </span>
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
