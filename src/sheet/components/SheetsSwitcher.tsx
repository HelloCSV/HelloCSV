import { Tabs } from '@/components';
import { ExclamationCircleIcon } from '@heroicons/react/16/solid';
import { useImporterDefinition } from '@/importer/hooks';
import { useImporterState } from '@/importer/reducer';

interface Props {
  onSheetChange: (sheetId: string) => void;
  sheetCountDict: Record<string, number>;
  idPrefix?: string;
}

export default function SheetsSwitcher({
  onSheetChange,
  sheetCountDict,
  idPrefix,
}: Props) {
  const { currentSheetId, validationErrors } = useImporterState();
  const { sheets: sheetDefinitions } = useImporterDefinition();

  return (
    <Tabs
      tabs={sheetDefinitions.map((sheet) => ({
        label: sheet.label + ` (${sheetCountDict[sheet.id]})`,
        value: sheet.id,
        icon: validationErrors.some((error) => error.sheetId === sheet.id) ? (
          <ExclamationCircleIcon className="mr-3 h-4 w-4" />
        ) : undefined,
      }))}
      activeTab={currentSheetId}
      onTabChange={onSheetChange}
      idPrefix={idPrefix}
    />
  );
}
