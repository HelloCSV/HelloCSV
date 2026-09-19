import { Tabs, Tooltip } from '@/components';
import { ExclamationCircleIcon } from '@heroicons/react/16/solid';
import { useImporterDefinition } from '@/importer/hooks';
import { useImporterState } from '@/importer/reducer';
import { useSheetRowLimits } from '@/importer/useSheetRowLimits';
import { useTranslations } from '@/i18';

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
  const { byId: rowLimitDict } = useSheetRowLimits();
  const { t } = useTranslations();

  return (
    <Tabs
      tabs={sheetDefinitions.map((sheet) => {
        const limit = rowLimitDict[sheet.id];
        const label =
          limit != null
            ? `${sheet.label} (${limit.count} / ${limit.maxRows})`
            : `${sheet.label} (${sheetCountDict[sheet.id]})`;
        const hasValidationError = validationErrors.some(
          (error) => error.sheetId === sheet.id
        );

        // Row-limit breaches take precedence over the generic validation icon.
        const iconTooltip = limit?.exceeded
          ? limit.tooltip
          : hasValidationError
            ? t('importer.sheetValidationErrors')
            : undefined;

        return {
          label,
          value: sheet.id,
          icon:
            iconTooltip != null ? (
              <Tooltip className="mr-3" tooltipText={iconTooltip}>
                <ExclamationCircleIcon className="h-4 w-4" />
              </Tooltip>
            ) : undefined,
        };
      })}
      activeTab={currentSheetId}
      onTabChange={onSheetChange}
      idPrefix={idPrefix}
    />
  );
}
