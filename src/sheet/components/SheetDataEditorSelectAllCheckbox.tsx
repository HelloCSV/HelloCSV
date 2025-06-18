import { SheetRow } from '@/types';
import { Checkbox } from '@/components';

interface Props {
  visibleData: SheetRow[];
  selectedRows: SheetRow[];
  setSelectedRows: (rows: SheetRow[]) => void;
}

export default function SheetDataEditorSelectAllCheckbox({
  visibleData,
  selectedRows,
  setSelectedRows,
}: Props) {
  const selectAllChecked =
    selectedRows.length === visibleData.length && visibleData.length > 0;

  function toggleSelectAll() {
    if (selectAllChecked) {
      setSelectedRows([]);
    } else {
      setSelectedRows(visibleData);
    }
  }

  return <Checkbox checked={selectAllChecked} setChecked={toggleSelectAll} />;
}
