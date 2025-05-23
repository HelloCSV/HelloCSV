import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { SheetDefinition, SheetState, SheetRow, SheetViewMode } from '../types';
import {
  CellChangedPayload,
  ImporterOutputFieldType,
  ImporterValidationError,
  RemoveRowsPayload,
} from '../../types';
import SheetDataEditorTable from './SheetDataEditorTable';
import SheetDataEditorHeader from './SheetDataEditorHeader';
import SheetDataEditorActions from './SheetDataEditorActions';
import { useFilteredRowData } from '../utils';

interface Props {
  sheetDefinition: SheetDefinition;
  data: SheetState;
  allData: SheetState[];
  sheetValidationErrors: ImporterValidationError[];
  setRowData: (payload: CellChangedPayload) => void;
  removeRows: (payload: RemoveRowsPayload) => void;
  addEmptyRow: () => void;
  resetState: () => void;
}

export default function SheetDataEditor({
  sheetDefinition,
  data,
  allData,
  sheetValidationErrors,
  setRowData,
  removeRows,
  addEmptyRow,
  resetState,
}: Props) {
  const [selectedRows, setSelectedRows] = useState<SheetRow[]>([]);
  const [viewMode, setViewMode] = useState<SheetViewMode>('all');
  const [searchPhrase, setSearchPhrase] = useState('');
  const [errorColumnFilter, setErrorColumnFilter] = useState<string | null>(
    null
  );

  useEffect(() => {
    setSelectedRows([]); // On changing sheets
    setViewMode('all');
  }, [sheetDefinition]);

  const rowData = useFilteredRowData(
    data,
    allData,
    viewMode,
    sheetValidationErrors,
    errorColumnFilter,
    sheetDefinition,
    searchPhrase
  );

  const rowValidationSummary = useMemo(() => {
    const allRows = data.rows;
    const validRows = allRows.filter(
      (_, index) =>
        !sheetValidationErrors.some((error) => error.rowIndex === index)
    );
    const invalidRows = allRows.filter((_, index) =>
      sheetValidationErrors.some((error) => error.rowIndex === index)
    );
    return {
      all: allRows.length,
      valid: validRows.length,
      errors: invalidRows.length,
    };
  }, [data, sheetValidationErrors]);

  const columns = useMemo<ColumnDef<SheetRow>[]>(
    () =>
      sheetDefinition.columns.map((column) => ({
        id: column.id,
        accessorFn: (row) => row[column.id],
        header: () => <SheetDataEditorHeader column={column} />,
        sortUndefined: 'last',
        sortingFn: 'auto',
        size: 32 // padding
          + Math.max(
            column.label.length, // label size
            ...rowData.map(row => row[column.id].toString().length) // max length value
          ) * 7
          + ('isReadOnly' in column && column.isReadOnly ? 16 : 0), // readonly icon
        maxSize: 250,
        meta: { columnLabel: column.label },
      })),
    [sheetDefinition]
  );

  const table = useReactTable<SheetRow>({
    data: rowData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function onCellValueChanged(
    rowIndex: number,
    columnId: string,
    value: ImporterOutputFieldType
  ) {
    const rowValue = { ...data.rows[rowIndex] };
    rowValue[columnId] = value;

    setRowData({
      sheetId: sheetDefinition.id,
      value: rowValue,
      rowIndex,
    });
  }

  const tableContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-none">
        <SheetDataEditorActions
          sheetDefinition={sheetDefinition}
          rowData={rowData}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          viewMode={viewMode}
          setViewMode={setViewMode}
          searchPhrase={searchPhrase}
          setSearchPhrase={setSearchPhrase}
          errorColumnFilter={errorColumnFilter}
          setErrorColumnFilter={setErrorColumnFilter}
          removeRows={removeRows}
          addEmptyRow={addEmptyRow}
          sheetValidationErrors={sheetValidationErrors}
          rowValidationSummary={rowValidationSummary}
          resetState={resetState}
        />
      </div>

      <div
        className="relative grid min-h-0 overflow-y-auto"
        ref={tableContainerRef}
      >
        <SheetDataEditorTable
          tableContainerRef={tableContainerRef}
          table={table}
          sheetDefinition={sheetDefinition}
          visibleData={rowData}
          allData={allData}
          sheetValidationErrors={sheetValidationErrors}
          onCellValueChanged={onCellValueChanged}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
        />
      </div>
    </div>
  );
}
