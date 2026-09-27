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
    'hc:bg-hello-csv-muted hc:py-3.5 hc:pr-3 hc:pl-4 hc:text-left hc:text-sm hc:font-semibold hc:text-hello-csv-text hc:whitespace-nowrap hc:border-y hc:border-hello-csv-border-strong';
  const cellClass =
    'hc:text-sm hc:font-medium hc:whitespace-nowrap hc:text-hello-csv-text hc:border-b hc:border-hello-csv-border-strong';

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
      className="hc:w-full hc:table-fixed hc:border-separate hc:border-spacing-0"
      aria-label={t('sheet.sheetTitle')}
      role="grid"
      aria-multiselectable="true"
      aria-rowcount={rows.length + 1}
      aria-colcount={dataColCount + (hasCheckboxColumn ? 1 : 0)}
    >
      <thead className="hc:bg-hello-csv-muted hc:sticky hc:top-0 hc:z-10">
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
                    ? `${headerClass} hc:sticky hc:left-0 hc:z-20`
                    : `hc:relative hc:z-10 ${headerClass}`
                }
                colSpan={header.colSpan}
                style={{ width: header.getSize() }}
              >
                <div
                  className={`hc:flex hc:w-full ${
                    header.column.getCanSort()
                      ? 'hc:cursor-pointer hc:select-none'
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
                    className="hc:bg-hello-csv-text-muted hc:text-hello-csv-surface hc:ml-2 hc:flex-none hc:rounded-sm"
                  >
                    {{
                      asc: (
                        <ChevronUpIcon
                          aria-hidden="true"
                          className="hc:size-5"
                        />
                      ),
                      desc: (
                        <ChevronDownIcon
                          aria-hidden="true"
                          className="hc:size-5"
                        />
                      ),
                    }[header.column.getIsSorted() as string] ?? null}
                  </span>

                  {header.column.getCanResize() && (
                    <div
                      key={`resize-icon-${headerGroup.id}-${header.id}`}
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className="hc:bg-hello-csv-border hc:absolute hc:top-0 hc:right-0 hc:h-full hc:w-0.5 hc:cursor-col-resize hc:touch-none hc:select-none"
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        ))}
      </thead>

      <tbody
        className="hc:divide-hello-csv-border hc:divide-y"
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
                    className={`hc:bg-hello-csv-muted ${cellClass} hc:sticky hc:left-0 hc:z-6 hc:pr-3 hc:pl-4`}
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
