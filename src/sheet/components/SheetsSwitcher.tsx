import { Tabs } from '../../components';
import { ImporterValidationError } from '../../types';
import { ExclamationCircleIcon } from '@heroicons/react/16/solid';
import { useImporterDefinition } from '@/importer/hooks';

interface Props {
  activeSheetId: string;
  onSheetChange: (sheetId: string) => void;
  validationErrors: ImporterValidationError[];
  sheetCountDict: Record<string, number>;
}

export default function SheetsSwitcher({
  activeSheetId,
  onSheetChange,
  validationErrors,
  sheetCountDict,
}: Props) {
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
      activeTab={activeSheetId}
      onTabChange={onSheetChange}
    />
  );
}
