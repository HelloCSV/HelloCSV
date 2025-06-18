import { SheetRow } from '@/types';
import { Checkbox } from '@/components';
import { Row } from '@tanstack/react-table';
import { SetStateAction, Dispatch } from 'preact/compat';

interface Props {
  row: Row<SheetRow>;
  selectedRows: SheetRow[];
  setSelectedRows: Dispatch<SetStateAction<SheetRow[]>>;
}

export default function SheetDataEditorSelectCheckbox({
  row,
  selectedRows,
  setSelectedRows,
}: Props) {
  function toggleRowSelection(row: SheetRow) {
    if (selectedRows.includes(row)) {
      setSelectedRows((selectedRows) => selectedRows.filter((r) => r !== row));
    } else {
      setSelectedRows((selectedRows) => [...selectedRows, row]);
    }
  }

  return (
    <Checkbox
      checked={selectedRows.includes(row.original)}
      setChecked={() => toggleRowSelection(row.original)}
      label={`${Number(row.id) + 1}`}
    />
  );
}
