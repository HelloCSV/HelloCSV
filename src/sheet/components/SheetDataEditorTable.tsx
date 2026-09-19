import { flexRender, Table } from '@tanstack/react-table';
import SheetDataEditorCell from './SheetDataEditorCell';
import {
  EnumLabelDict,
  SheetDefinition,
  SheetRow,
  SheetState,
  ImporterOutputFieldType,
  ImporterValidationError,
  TranslationKey,
} from '@/types';
import { useTranslations } from '@/i18';
import { findRowIndex } from '../utils';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import { useVirtualizer } from '@tanstack/react-virtual';
import { RefObject, useCallback, useEffect } from 'preact/compat';
import {
  CHECKBOX_COLUMN_ID,
  CHECKBOX_COLUMN_WIDTH,
  ESTIMATED_ROW_HEIGHT,
} from '@/constants';
import { useGridSelectionContext } from '../grid/GridSelectionContext';
import { GridDimensions } from '../grid/gridTypes';

interface Props {
  table: Table<SheetRow>;
  sheetDefinition: SheetDefinition;
  allData: SheetState[];
  sheetValidationErrors: ImporterValidationError[];
  onCellValueChanged: (
    rowIndex: number,
    columnId: string,
    value: ImporterOutputFieldType
  ) => void;
  setSelectedRows: (rows: SheetRow[]) => void;
  tableContainerRef: RefObject<HTMLDivElement>;
  enumLabelDict: EnumLabelDict;
  gridDims: GridDimensions;
  hasCheckboxColumn: boolean;
}

export default function SheetDataEditorTable({
  table,
  sheetDefinition,
  allData,
  sheetValidationErrors,
  onCellValueChanged,
  setSelectedRows,
  tableContainerRef,
  enumLabelDict,
  gridDims,
  hasCheckboxColumn,
}: Props) {
  const { t } = useTranslations();
  const selection = useGridSelectionContext();

  function cellErrors(columnId: string, rowIndex: number) {
    return sheetValidationErrors.filter(
      (validation) =>
        validation.columnId === columnId && validation.rowIndex === rowIndex
    );
  }

  const headerClass =
    'bg-hello-csv-muted py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-hello-csv-text whitespace-nowrap border-y border-hello-csv-border-strong';
  const cellClass =
    'text-sm font-medium whitespace-nowrap text-hello-csv-text border-b border-hello-csv-border-strong';

  const rows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    measureElement: (element) => element?.getBoundingClientRect().height,
    overscan: 20,
  });

  // Keep the active cell scrolled into view and focused, even across
  // virtualization (the active cell may be unmounted when it changes).
  const active = selection.state.active;
  const editing = selection.state.editing;

  useEffect(() => {
    if (!active || editing) return;
    rowVirtualizer.scrollToIndex(active.row, { align: 'auto' });

    let raf = 0;
    let tries = 0;
    const focusActiveCell = () => {
      const container = tableContainerRef.current;
      const td = container?.querySelector<HTMLElement>(
        `[data-cell-row="${active.row}"][data-cell-col="${active.col}"]`
      );
      if (td) {
        if (document.activeElement !== td) td.focus({ preventScroll: true });
        revealHorizontally(container!, td);
      } else if (tries++ < 5) {
        raf = requestAnimationFrame(focusActiveCell);
      }
    };
    raf = requestAnimationFrame(focusActiveCell);
    // Cancel any pending cell-focus when editing begins (or active changes),
    // so a late frame doesn't steal focus from the just-opened cell editor.
    return () => cancelAnimationFrame(raf);
    // rowVirtualizer / refs are stable enough; re-run only on active/editing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.row, active?.col, editing?.row, editing?.col]);

  function revealHorizontally(container: HTMLElement, td: HTMLElement) {
    const containerRect = container.getBoundingClientRect();
    const cellRect = td.getBoundingClientRect();

    const stickyLeft = hasCheckboxColumn ? CHECKBOX_COLUMN_WIDTH : 0;

    if (cellRect.left < containerRect.left + stickyLeft) {
      container.scrollLeft -= containerRect.left + stickyLeft - cellRect.left;
    } else if (cellRect.right > containerRect.right) {
      container.scrollLeft += cellRect.right - containerRect.right;
    }
  }

  const visibleRows = rowVirtualizer.getVirtualItems().map((virtualRow) => ({
    row: rows[virtualRow.index],
    index: virtualRow.index,
    start: virtualRow.start,
    end: virtualRow.end,
  }));

  // https://github.com/TanStack/virtual/discussions/476
  const [paddingTop, paddingBottom] =
    visibleRows.length > 0
      ? [
          Math.max(
            0,
            visibleRows[0].start - rowVirtualizer.options.scrollMargin
          ),
          Math.max(
            0,
            rowVirtualizer.getTotalSize() -
              visibleRows[visibleRows.length - 1].end
          ),
        ]
      : [0, 0];

  const measureRef = useCallback(
    (node: HTMLElement | null) => {
      if (node) rowVirtualizer.measureElement(node);
    },
    [rowVirtualizer]
  );

  const dataColCount = sheetDefinition.columns.length;

  return (
    <table
      className="w-full table-fixed border-separate border-spacing-0"
      aria-label={t('sheet.sheetTitle')}
      role="grid"
      aria-multiselectable="true"
      aria-rowcount={rows.length + 1}
      aria-colcount={dataColCount + (hasCheckboxColumn ? 1 : 0)}
    >
      <thead className="bg-hello-csv-muted sticky top-0 z-10">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} role="row" aria-rowindex={1}>
            {headerGroup.headers.map((header, headerIndex) => (
              <th
                key={header.id}
                role="columnheader"
                aria-colindex={headerIndex + 1}
                aria-sort={
                  header.column.getIsSorted() === 'asc'
                    ? 'ascending'
                    : header.column.getIsSorted() === 'desc'
                      ? 'descending'
                      : header.column.getCanSort()
                        ? 'none'
                        : undefined
                }
                className={
                  header.column.id === CHECKBOX_COLUMN_ID
                    ? `${headerClass} sticky left-0 z-20`
                    : `relative z-10 ${headerClass}`
                }
                colSpan={header.colSpan}
                style={{ width: header.getSize() }}
              >
                <div
                  className={`flex w-full ${
                    header.column.getCanSort()
                      ? 'cursor-pointer select-none'
                      : ''
                  }`}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder ? null : (
                    <div key={`header-${headerGroup.id}-${header.id}`}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </div>
                  )}

                  <span
                    key={`sort-icon-${headerGroup.id}-${header.id}`}
                    className="bg-hello-csv-text-muted text-hello-csv-surface ml-2 flex-none rounded-sm"
                  >
                    {{
                      asc: (
                        <ChevronUpIcon aria-hidden="true" className="size-5" />
                      ),
                      desc: (
                        <ChevronDownIcon
                          aria-hidden="true"
                          className="size-5"
                        />
                      ),
                    }[header.column.getIsSorted() as string] ?? null}
                  </span>

                  {header.column.getCanResize() && (
                    <div
                      key={`resize-icon-${headerGroup.id}-${header.id}`}
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className="bg-hello-csv-border absolute top-0 right-0 h-full w-0.5 cursor-col-resize touch-none select-none"
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        ))}
      </thead>

      <tbody
        className="divide-hello-csv-border divide-y"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {/* Padding used for virtualization */}
        <tr role="presentation">
          <td style={{ height: paddingTop }} />
        </tr>
        {visibleRows.map(({ row, index }) => (
          <tr
            key={row.id}
            role="row"
            aria-rowindex={index + 2}
            data-index={index}
            ref={measureRef}
          >
            {row.getVisibleCells().map((cell, cellIndex) => {
              if (cell.column.id === CHECKBOX_COLUMN_ID) {
                return (
                  <td
                    key={cell.id}
                    role="gridcell"
                    aria-colindex={1}
                    aria-label={`Select row ${Number(row.id) + 1}`}
                    className={`bg-hello-csv-muted ${cellClass} sticky left-0 z-6 pr-3 pl-4`}
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              }

              // We subtract 1 because we have a checkbox column on the first position
              const dataCol = cellIndex - (hasCheckboxColumn ? 1 : 0);
              const columnId = sheetDefinition.columns[dataCol].id;
              // TODO: Check if it works correctly for 2 identical rows
              const rowIndex = findRowIndex(
                allData,
                sheetDefinition.id,
                row.original
              );

              const cellErrorsText = cellErrors(columnId, rowIndex)
                .map((e) => t(e.message as TranslationKey))
                .join(', ');

              return (
                <SheetDataEditorCell
                  key={cell.id}
                  coord={{ row: index, col: dataCol }}
                  gridDims={gridDims}
                  widthPx={cell.column.getSize()}
                  ariaColIndex={dataCol + (hasCheckboxColumn ? 2 : 1)}
                  tdClassName={cellClass}
                  rowId={row.id}
                  sheetDefinition={sheetDefinition}
                  columnDefinition={
                    sheetDefinition.columns.find((c) => c.id === columnId)!
                  }
                  allData={allData}
                  value={cell.getValue() as ImporterOutputFieldType}
                  onUpdated={(value) =>
                    onCellValueChanged(rowIndex, columnId, value)
                  }
                  clearRowsSelection={() => setSelectedRows([])}
                  errorsText={cellErrorsText}
                  enumLabelDict={enumLabelDict}
                />
              );
            })}
          </tr>
        ))}
        {/* Padding used for virtualization */}
        <tr role="presentation">
          <td style={{ height: paddingBottom }} />
        </tr>
      </tbody>
    </table>
  );
}
