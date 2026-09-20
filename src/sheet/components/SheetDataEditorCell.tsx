import { useEffect, useRef } from 'preact/hooks';
import {
  EnumLabelDict,
  ImporterOutputFieldType,
  SheetColumnDefinition,
  SheetColumnDateTypeArguments,
  isDateLikeColumn,
  SheetState,
  SelectOption,
  SheetDefinition,
} from '@/types';
import { Input, Select, DatePicker, SheetTooltip } from '@/components';
import {
  buildMultiEnumEditorOptions,
  extractReferenceColumnPossibleValues,
  getCellDisplayValue,
  isColumnReadOnly,
} from '../utils';
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import { getLabelDict, getLabelDictValue } from '@/utils';
import { useTranslations } from '@/i18';
import { useLongPress } from '@/utils/hooks';
import { useImporterDefinition } from '@/importer/hooks';
import {
  DEFAULT_BOOLEAN_FALSE_LABEL,
  DEFAULT_BOOLEAN_TRUE_LABEL,
  DATE_PICKER_PANEL_ATTR,
} from '@/constants';
import { useGridSelectionContext } from '../grid/GridSelectionContext';
import { moveCoord } from '../grid/coordinates';
import { coerceCellValue } from '../valueCoercion';
import { CellCoord, GridDimensions } from '../grid/gridTypes';

interface Props {
  coord: CellCoord;
  gridDims: GridDimensions;
  widthPx: number;
  ariaColIndex: number;
  tdClassName: string;
  rowId: string;
  sheetDefinition: SheetDefinition;
  columnDefinition: SheetColumnDefinition;
  value: ImporterOutputFieldType;
  onUpdated: (value: ImporterOutputFieldType) => void;
  allData: SheetState[];
  clearRowsSelection: () => void;
  errorsText: string;
  enumLabelDict: EnumLabelDict;
}

/** Columns whose editor is a headlessui Combobox (own key handling). */
function isSelectTypeColumn(column: SheetColumnDefinition): boolean {
  return (
    column.type === 'boolean' ||
    column.type === 'enum' ||
    column.type === 'reference'
  );
}

/**
 * Columns whose editor owns its own keyboard navigation and commit logic, so the
 * generic Enter/Tab handler is skipped and edit ends only when focus leaves the
 * cell (not on every internal close).
 */
function ownsKeyboardEditor(column: SheetColumnDefinition): boolean {
  return isSelectTypeColumn(column) || isDateLikeColumn(column);
}

export default function SheetDataEditorCell({
  coord,
  gridDims,
  widthPx,
  ariaColIndex,
  tdClassName,
  rowId,
  sheetDefinition,
  columnDefinition,
  value,
  onUpdated,
  allData,
  clearRowsSelection,
  errorsText,
  enumLabelDict,
}: Props) {
  const { t } = useTranslations();
  const { availableActions } = useImporterDefinition();
  const selection = useGridSelectionContext();

  const editMode = selection.isEditing(coord);
  const isActive = selection.isActive(coord);
  const isSelected = selection.isSelected(coord);

  const inputRef = useRef<HTMLInputElement>(null);
  const tdRef = useRef<HTMLDivElement>(null);
  // Guards against the input's onBlur committing again after an explicit
  // keyboard commit/cancel has already resolved the edit.
  const committedRef = useRef(false);

  const readOnly =
    isColumnReadOnly(columnDefinition) ||
    !availableActions.includes('editRows');

  function beginEdit(initialValue: 'preserve' | { char: string }) {
    if (readOnly) return;

    selection.startEdit(coord, initialValue);
  }

  function endEdit() {
    selection.stopEditing();
  }

  useEffect(() => {
    if (editMode) {
      committedRef.current = false;
      clearRowsSelection();
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
    // We don't want to include clearRowsSelection in the dependencies array, since it's should impact the clearing itself
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode]);

  const { displayValue, valueEmpty } = getCellDisplayValue(
    sheetDefinition,
    columnDefinition,
    value,
    enumLabelDict
  );

  const longPressHandlers = useLongPress(
    () => {
      if (!readOnly) beginEdit('preserve');
    },
    { disabled: readOnly }
  );

  const cellBackgroundColor = errorsText
    ? 'bg-hello-csv-danger-extra-light'
    : readOnly
      ? 'bg-hello-csv-muted'
      : '';

  // Both highlights are rendered as overlays on top of the cell content, so they
  // remain visible over the opaque error/read-only cell backgrounds (an inset
  // ring or tint placed behind the content would be covered by those). The
  // active cell gets a ring; other selected cells get a translucent tint.
  const activeClasses = isActive ? 'z-1' : '';

  function commitInputValue(raw: ImporterOutputFieldType) {
    committedRef.current = true;
    onUpdated(coerceCellValue(columnDefinition, String(raw ?? '')));
    endEdit();
  }

  function handleTdKeyDown(e: KeyboardEvent) {
    if (!editMode) return;

    if (e.key === 'Escape') {
      // Cancel without committing; blur is suppressed via committedRef.
      committedRef.current = true;
      endEdit();
      e.preventDefault();
      // Editor keys must not reach the grid's navigation handler.
      e.stopPropagation();
      return;
    }

    // Combobox / date-picker editors handle their own navigation/commit keys.
    if (ownsKeyboardEditor(columnDefinition)) return;

    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      // Prevent the container's navigation handler from also moving the cursor.
      e.stopPropagation();
      commitInputValue(inputRef.current?.value ?? '');
      const direction =
        e.key === 'Tab'
          ? e.shiftKey
            ? 'left'
            : 'right'
          : e.shiftKey
            ? 'up'
            : 'down';
      selection.setActive(moveCoord(coord, direction, gridDims));
    }
  }

  function handleTdMouseDown(e: MouseEvent) {
    if (editMode || e.button !== 0) return;
    if (e.shiftKey) {
      selection.extendTo(coord);
    } else {
      selection.beginDrag(coord);
    }
    // Avoid starting a native text selection while drag-selecting cells.
    e.preventDefault();
  }

  function handleTdMouseEnter() {
    if (!editMode) selection.dragTo(coord);
  }

  // For dropdown (Combobox) editors, end editing only when focus actually leaves
  // the cell — NOT on every headlessui close. headlessui closes the dropdown on
  // things like clicking the ✕ or the field itself; tying endEdit to those made
  // editing exit unexpectedly. Focus stays on the combobox input during those
  // interactions, so it only leaves when the user clicks another cell / outside.
  function handleTdBlur(e: FocusEvent) {
    if (!editMode || !ownsKeyboardEditor(columnDefinition)) return;

    const next = e.relatedTarget as Node | null;
    if (next && tdRef.current?.contains(next)) return;
    // The DatePicker's popover is portaled outside the cell; focus moving into
    // it (e.g. onto a calendar day) must not end the edit.
    if (next instanceof Element && next.closest(`[${DATE_PICKER_PANEL_ATTR}]`))
      return;

    endEdit();
  }

  function handleTdClick(e: MouseEvent) {
    if (editMode) return;

    if (e.detail > 1) {
      beginEdit('preserve');
    } else if (e.shiftKey) {
      selection.extendTo(coord);
    } else {
      selection.setActive(coord);
    }
  }

  function commitSelectValue(
    newValue: ImporterOutputFieldType,
    { close = true }: { close?: boolean } = {}
  ) {
    committedRef.current = true;
    onUpdated(newValue);
    if (close) endEdit();
  }

  // When editing started by typing a character (type-to-edit), that character
  // seeds the text input value and the dropdown search filter.
  const typeToEditChar = (() => {
    const initial = selection.state.editInitialValue;
    return initial && typeof initial === 'object' && 'char' in initial
      ? initial.char
      : undefined;
  })();
  const seedValue: ImporterOutputFieldType = typeToEditChar ?? value;

  const gridCellProps = {
    ref: tdRef,
    role: 'gridcell' as const,
    'aria-colindex': ariaColIndex,
    'aria-selected': isSelected,
    'data-cell-row': coord.row,
    'data-cell-col': coord.col,
    tabIndex: isActive ? 0 : -1,
    onKeyDown: handleTdKeyDown,
    onClick: handleTdClick,
    onMouseDown: handleTdMouseDown,
    onMouseEnter: handleTdMouseEnter,
    // focusout (bubbles) rather than blur (doesn't) so we catch the combobox
    // input losing focus to somewhere outside the cell.
    onFocusOut: handleTdBlur,
    className: `relative flex h-full w-full items-stretch outline-none ${activeClasses}`,
  };

  const highlightOverlay = isActive ? (
    <div className="ring-hello-csv-primary pointer-events-none absolute inset-0 ring-2 ring-inset" />
  ) : isSelected ? (
    <div className="bg-hello-csv-primary/20 pointer-events-none absolute inset-0" />
  ) : null;

  function renderEditor() {
    if (columnDefinition.type === 'boolean') {
      const selectOptions = [true, false].map((v) => ({
        label: v
          ? (columnDefinition.typeArguments?.trueLabel ??
            DEFAULT_BOOLEAN_TRUE_LABEL)
          : (columnDefinition.typeArguments?.falseLabel ??
            DEFAULT_BOOLEAN_FALSE_LABEL),
        value: v,
      }));

      return (
        <Select
          autoFocus
          immediate
          options={selectOptions}
          value={value}
          onChange={(v) =>
            commitSelectValue((v as ImporterOutputFieldType) ?? '')
          }
        />
      );
    }

    if (columnDefinition.type === 'reference') {
      const referenceData = extractReferenceColumnPossibleValues(
        columnDefinition,
        allData
      );
      const labelDict = getLabelDict(columnDefinition, enumLabelDict);
      const selectOptions = referenceData.map((v) => ({
        label: String(getLabelDictValue(labelDict, v)),
        value: v,
      }));

      return (
        <Select
          autoFocus
          immediate
          searchable
          searchInputAsFilter
          clearable
          options={selectOptions}
          value={value}
          onChange={(v) =>
            // null (deselect) -> undefined so the field is unset, not empty.
            commitSelectValue((v ?? undefined) as ImporterOutputFieldType)
          }
        />
      );
    }

    if (columnDefinition.type === 'enum') {
      const { values, multiple } = columnDefinition.typeArguments as {
        values: SelectOption<string>[];
        multiple?: boolean;
      };

      if (multiple) {
        const optionsWithInvalidValues = buildMultiEnumEditorOptions(
          value,
          values,
          (raw) => t('components.select.invalidOption', { value: raw }),
          <ExclamationTriangleIcon
            className="text-hello-csv-danger mr-2 h-5 w-5 shrink-0"
            aria-hidden="true"
          />
        );

        return (
          <Select
            autoFocus
            immediate
            searchable
            searchInputAsFilter
            clearable
            multiple
            options={optionsWithInvalidValues}
            value={value}
            onChange={(newValue) =>
              commitSelectValue((newValue as string[]) ?? [], { close: false })
            }
          />
        );
      }

      return (
        <Select
          autoFocus
          immediate
          searchable
          searchInputAsFilter
          clearable
          options={values}
          value={value}
          onChange={(newValue) =>
            // null (deselect) -> undefined so the field is unset, not empty.
            commitSelectValue(
              (newValue ?? undefined) as ImporterOutputFieldType
            )
          }
        />
      );
    }

    if (isDateLikeColumn(columnDefinition)) {
      // Widen to the superset: `date` omits showSeconds/hourFormat, but the
      // DatePicker (and its `mode`) ignores them when there's no time part.
      const typeArguments: SheetColumnDateTypeArguments =
        columnDefinition.typeArguments ?? {};
      return (
        <DatePicker
          mode={columnDefinition.type}
          value={typeof value === 'string' ? value : ''}
          seedText={typeToEditChar}
          {...typeArguments}
          aria-label={`edit row ${Number(rowId) + 1}'s ${columnDefinition.label}`}
          onCommit={(storedValue) => commitInputValue(storedValue)}
        />
      );
    }

    return (
      <Input
        aria-label={`edit row ${Number(rowId) + 1}'s ${columnDefinition.label}`}
        type={columnDefinition.type === 'number' ? 'number' : 'text'}
        classes="block w-full"
        value={seedValue}
        onBlur={(v) => {
          if (committedRef.current) return;
          commitInputValue(v);
        }}
        ref={inputRef}
      />
    );
  }

  if (editMode) {
    return (
      <td
        role="presentation"
        className={tdClassName}
        style={{ width: widthPx }}
      >
        <div {...gridCellProps}>
          <div className="w-full">{renderEditor()}</div>
        </div>
      </td>
    );
  }

  return (
    <td role="presentation" className={tdClassName} style={{ width: widthPx }}>
      {/* The tooltip wrapper must be an ancestor of the focusable grid cell so
          `group-focus-within` reveals the error/read-only tooltip and outline
          when the cell is focused via the keyboard. */}
      <SheetTooltip
        focusable={false}
        variant={errorsText ? 'error' : 'info'}
        // Open upward on the last row so the popover isn't clipped by the
        // bottom of the scroll container.
        placement={coord.row >= gridDims.rowCount - 1 ? 'top' : 'bottom'}
        tooltipText={
          errorsText ? errorsText : readOnly ? t('sheet.readOnly') : ''
        }
      >
        <div {...gridCellProps}>
          <div
            aria-label={`row ${Number(rowId) + 1} ${columnDefinition.label} ${displayValue}`}
            {...longPressHandlers}
            className={`h-full w-full py-4 pr-3 pl-4 ${cellBackgroundColor} touch-manipulation truncate overflow-hidden whitespace-nowrap`}
            title={valueEmpty ? undefined : `${displayValue}`}
          >
            {columnDefinition.customRender
              ? columnDefinition.customRender(value, displayValue)
              : displayValue}
          </div>
          {highlightOverlay}
        </div>
      </SheetTooltip>
    </td>
  );
}
