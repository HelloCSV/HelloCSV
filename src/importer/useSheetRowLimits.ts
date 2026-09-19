import { useMemo } from 'preact/hooks';
import { useImporterDefinition } from './hooks';
import { useImporterState } from './reducer';
import { useTranslations } from '@/i18';
import { getSheetRowLimitInfo, SheetRowLimitInfo } from '@/utils';

interface SheetRowLimit extends SheetRowLimitInfo {
  tooltip: string;
}

export interface SheetRowLimits {
  limits: SheetRowLimit[];
  byId: Record<string, SheetRowLimit>;
  /** Limited sheets that currently exceed their `maxRows`. */
  exceeded: SheetRowLimit[];
  /** Whether any sheet exceeds its `maxRows`. */
  hasExceeded: boolean;
  preventUpload: boolean;
  uploadBlockedTooltip: string;
}

export function useSheetRowLimits(): SheetRowLimits {
  const { sheets, preventUploadOnValidationErrors } = useImporterDefinition();
  const { sheetData, validationErrors } = useImporterState();
  const { t } = useTranslations();

  return useMemo(() => {
    const limits: SheetRowLimit[] = getSheetRowLimitInfo(sheets, sheetData).map(
      (limit) => ({
        ...limit,
        tooltip: t('importer.rowLimitExceeded', {
          sheet: limit.label,
          count: String(limit.count),
          limit: String(limit.maxRows),
        }),
      })
    );

    const byId = Object.fromEntries(
      limits.map((limit) => [limit.sheetId, limit])
    );
    const exceeded = limits.filter((limit) => limit.exceeded);
    const hasExceeded = exceeded.length > 0;

    let rowLimitTooltip: string | null = null;
    if (exceeded.length === 1) {
      rowLimitTooltip = exceeded[0].tooltip;
    } else if (exceeded.length > 1) {
      rowLimitTooltip = t('importer.rowLimitExceededMultiple', {
        sheets: exceeded
          .map((limit) => `${limit.label} (${limit.count}/${limit.maxRows})`)
          .join(', '),
      });
    }

    const preventUploadOnErrors =
      typeof preventUploadOnValidationErrors === 'function'
        ? (preventUploadOnValidationErrors(validationErrors) ?? false)
        : (preventUploadOnValidationErrors ?? false);

    return {
      limits,
      byId,
      exceeded,
      hasExceeded,
      preventUpload:
        (preventUploadOnErrors && validationErrors.length > 0) || hasExceeded,
      uploadBlockedTooltip: rowLimitTooltip ?? t('importer.uploadBlocked'),
    };
  }, [sheets, sheetData, validationErrors, preventUploadOnValidationErrors, t]);
}
