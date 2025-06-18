import { useEffect, useRef, useState } from 'preact/hooks';
import {
  EnumLabelDict,
  ImporterOutputFieldType,
  SheetColumnDefinition,
  SheetState,
} from '@/types';
import { Input, Select, SheetTooltip } from '@/components';
import {
  extractReferenceColumnPossibleValues,
  getCellDisplayValue,
  isColumnReadOnly,
} from '../utils';
import { getLabelDict, getLabelDictValue } from '@/utils';
import { useTranslations } from '@/i18';
import { useLongPress } from '@/utils/hooks';

interface Props {
  rowId: string;
  columnDefinition: SheetColumnDefinition;
  value: ImporterOutputFieldType;
  onUpdated: (value: ImporterOutputFieldType) => void;
  allData: SheetState[];
  clearRowsSelection: () => void;
  errorsText: string;
  enumLabelDict: EnumLabelDict;
}

export default function SheetDataEditorCell({
  rowId,
  columnDefinition,
  value,
  onUpdated,
  allData,
  clearRowsSelection,
  errorsText,
  enumLabelDict,
}: Props) {
  const { t } = useTranslations();

  const [editMode, setEditMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editMode) {
      clearRowsSelection();
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
    // We don't want to include clearRowsSelection in the dependencies array, since it's should impact the clearing itself
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode]);

  const { displayValue, valueEmpty } = getCellDisplayValue(
    columnDefinition,
    value,
    enumLabelDict
  );

  const readOnly = isColumnReadOnly(columnDefinition);

  const longPressHandlers = useLongPress(
    () => {
      if (!readOnly) setEditMode(true);
    },
    { disabled: readOnly }
  );

  const cellBackgroundColor = errorsText
    ? 'bg-hello-csv-danger-extra-light'
    : readOnly
      ? 'bg-hello-csv-muted'
      : '';

  if (!editMode) {
    return (
      <SheetTooltip
        variant={errorsText ? 'error' : 'info'}
        tooltipText={
          errorsText ? errorsText : readOnly ? t('sheet.readOnly') : ''
        }
      >
        <div
          role="button"
          tabIndex={0}
          aria-label={`row ${Number(rowId) + 1} ${columnDefinition.label} ${displayValue}`}
          {...longPressHandlers}
          onClick={(e) => !readOnly && e.detail > 1 && setEditMode(true)}
          className={`h-full w-full py-4 pr-3 pl-4 ${cellBackgroundColor} touch-manipulation truncate overflow-hidden whitespace-nowrap`}
          title={valueEmpty ? undefined : `${displayValue}`}
        >
          {columnDefinition.customRender
            ? columnDefinition.customRender(value, displayValue)
            : displayValue}
        </div>
      </SheetTooltip>
    );
  }

  function updateValue(value: ImporterOutputFieldType) {
    setEditMode(false);

    if (
      columnDefinition.type === 'number' &&
      value !== '' &&
      !isNaN(Number(value))
    ) {
      onUpdated(Number(value));
    } else {
      onUpdated(value ?? '');
    }
  }

  if (columnDefinition.type === 'reference') {
    const referenceData = extractReferenceColumnPossibleValues(
      columnDefinition,
      allData
    );

    const labelDict = getLabelDict(columnDefinition, enumLabelDict);

    const selectOptions = referenceData.map((value) => ({
      label: String(getLabelDictValue(labelDict, value)),
      value,
    }));

    return (
      <Select
        searchable
        options={selectOptions}
        value={value}
        onChange={(value) =>
          updateValue((value as ImporterOutputFieldType) ?? '')
        }
      />
    );
  }

  if (columnDefinition.type === 'enum') {
    const enumArguments = columnDefinition.typeArguments;
    const selectOptions = enumArguments.values;

    return (
      <Select
        searchable
        options={selectOptions}
        value={value}
        onChange={(value) =>
          updateValue((value as ImporterOutputFieldType) ?? '')
        }
      />
    );
  }

  return (
    <Input
      aria-label={`edit row ${Number(rowId) + 1}'s ${columnDefinition.label}`}
      type={columnDefinition.type === 'number' ? 'number' : 'text'}
      classes="block w-full"
      value={value}
      onBlur={updateValue}
      ref={inputRef}
    />
  );
}
