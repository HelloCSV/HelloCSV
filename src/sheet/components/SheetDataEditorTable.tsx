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
import { RefObject } from 'preact/compat';
import { CHECKBOX_COLUMN_ID, ESTIMATED_ROW_HEIGHT } from '@/constants';

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
}: Props) {
  const { t } = useTranslations();

  function cellErrors(columnId: string, rowIndex: number) {
    return sheetValidationErrors.filter(
      (validation) =>
        validation.columnId === columnId && validation.rowIndex === rowIndex
    );
  }

  const headerClass =
    'bg-hello-csv-muted py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap border-y border-gray-300';
  const cellClass =
    'text-sm font-medium whitespace-nowrap text-gray-900 border-b border-gray-300';

  const rows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    measureElement: (element) => element?.getBoundingClientRect().height,
    overscan: 20,
  });

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

  return (
    <table
      className="w-full table-fixed border-separate border-spacing-0"
      aria-label={t('sheet.sheetTitle')}
    >
      <thead className="bg-hello-csv-muted sticky top-0 z-10">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
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
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}

                  <span className="ml-2 flex-none rounded-sm bg-gray-500 text-gray-200">
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
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className="absolute top-0 right-0 h-full w-0.5 cursor-col-resize touch-none bg-gray-200 select-none"
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        ))}
      </thead>

      <tbody
        className="divide-y divide-gray-200"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {/* Padding used for virtualization */}
        <tr>
          <td style={{ height: paddingTop }} />
        </tr>
        {visibleRows.map(({ row, index }) => (
          <tr
            key={row.id}
            data-index={index}
            ref={(node) => rowVirtualizer.measureElement(node)}
          >
            {row.getVisibleCells().map((cell, cellIndex) => {
              if (cell.column.id === CHECKBOX_COLUMN_ID) {
                return (
                  <td
                    key={cell.id}
                    aria-label={`Select row ${Number(row.id) + 1}`}
                    className={`bg-hello-csv-muted ${cellClass} sticky left-0 z-6 pr-3 pl-4`}
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              }

              // We subtract 1 because we have a checkbox column on the first position
              const columnId = sheetDefinition.columns[cellIndex - 1].id;
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
                <td
                  key={cell.id}
                  className={cellClass}
                  style={{ width: cell.column.getSize() }}
                >
                  <SheetDataEditorCell
                    rowId={row.id}
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
                </td>
              );
            })}
          </tr>
        ))}
        {/* Padding used for virtualization */}
        <tr>
          <td style={{ height: paddingBottom }} />
        </tr>
      </tbody>
    </table>
  );
}
