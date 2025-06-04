import { flexRender, Table } from '@tanstack/react-table';
import SheetDataEditorCell from './SheetDataEditorCell';
import { EnumLabelDict, SheetDefinition, SheetRow, SheetState } from '../types';
import {
  ImporterOutputFieldType,
  ImporterValidationError,
  TranslationKey,
} from '../../types';
import { Checkbox } from '../../components';
import { useTranslations } from '../../i18';
import { findRowIndex } from '../utils';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import { useVirtualizer } from '@tanstack/react-virtual';
import { RefObject } from 'preact/compat';

interface Props {
  table: Table<SheetRow>;
  sheetDefinition: SheetDefinition;
  visibleData: SheetRow[];
  allData: SheetState[];
  sheetValidationErrors: ImporterValidationError[];
  onCellValueChanged: (
    rowIndex: number,
    columnId: string,
    value: ImporterOutputFieldType
  ) => void;
  selectedRows: SheetRow[];
  setSelectedRows: (rows: SheetRow[]) => void;
  tableContainerRef: RefObject<HTMLDivElement>;
  enumLabelDict: EnumLabelDict;
}

export default function SheetDataEditorTable({
  table,
  sheetDefinition,
  visibleData,
  allData,
  sheetValidationErrors,
  onCellValueChanged,
  selectedRows,
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

  const selectAllChecked =
    selectedRows.length === visibleData.length && visibleData.length > 0;

  function toggleSelectAll() {
    if (selectAllChecked) {
      setSelectedRows([]);
    } else {
      setSelectedRows(visibleData);
    }
  }

  function toggleRowSelection(row: SheetRow) {
    if (selectedRows.includes(row)) {
      setSelectedRows(selectedRows.filter((r) => r !== row));
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  }

  const headerClass =
    'bg-hello-csv-muted py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap border-y border-gray-300';
  const cellClass =
    'text-sm font-medium whitespace-nowrap text-gray-900 border-b border-gray-300 max-w-[350px]';

  const rows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 52.62,
    measureElement: (element) => element?.getBoundingClientRect().height,
    overscan: 20,
  });

  const visibleRows = rowVirtualizer.getVirtualItems().map((virtualRow) => {
    return {
      row: rows[virtualRow.index],
      index: virtualRow.index,
      start: virtualRow.start,
      end: virtualRow.end,
    };
  });

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
      className="min-w-full border-separate border-spacing-0"
      aria-label={t('sheet.sheetTitle')}
    >
      <thead className="bg-hello-csv-muted sticky top-0 z-10">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            <th className={`${headerClass} sticky left-0 z-20`}>
              <Checkbox
                checked={selectAllChecked}
                setChecked={toggleSelectAll}
              />
            </th>

            {headerGroup.headers.map((header) => (
              <th key={header.id} className={`z-10 ${headerClass}`}>
                <div
                  className={`flex ${
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
        <tr>
          <td style={{ height: paddingTop }} />
        </tr>
        {visibleRows.map(({ row, index }) => (
          <tr
            key={row.id}
            data-index={index}
            ref={(node) => rowVirtualizer.measureElement(node)}
          >
            <td
              aria-label={`Select row ${Number(row.id) + 1}`}
              className={`bg-hello-csv-muted ${cellClass} sticky left-0 z-6 py-3.5 pr-3 pl-4`}
            >
              <Checkbox
                checked={selectedRows.includes(row.original)}
                setChecked={() => toggleRowSelection(row.original)}
                label={`${Number(row.id) + 1}`}
              />
            </td>

            {row.getVisibleCells().map((cell, cellIndex) => {
              const columnId = sheetDefinition.columns[cellIndex].id;
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
                  style={
                    {
                      // width: columnWidthDict[cell.column.id],
                      // minWidth: cell.column.getSize(),
                    }
                  }
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
        <tr>
          <td style={{ height: paddingBottom }} />
        </tr>
      </tbody>
    </table>
  );
}
