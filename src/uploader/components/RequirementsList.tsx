import { ImporterRequirementsType } from '../../types';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Tooltip } from '../../components/index';
import { useTranslations } from '../../i18';

interface Props {
  importerRequirements: ImporterRequirementsType;
}

export default function RequirementsList({ importerRequirements }: Props) {
  const { t } = useTranslations();

  return (
    <div className="h-full w-full space-y-5 overflow-y-auto">
      {Object.entries(importerRequirements)
        .filter(([, requirements]) => requirements.length > 0)
        .map(([groupName, requirements]) => {
          const group = groupName === 'required' ? 'required' : 'optional';

          return (
            <div key={groupName} className="me-3">
              <div className="border-hello-csv-border my-3 border-b pb-4 text-sm font-light uppercase">
                {t(`uploader.${group}Columns`)}
              </div>
              <div className="mt-4">
                {requirements.map((requirement) => (
                  <div
                    key={`${requirement.sheetId}-${requirement.columnId}`}
                    className="my-3 flex justify-between"
                  >
                    <div className="text-xs">{requirement.columnLabel}</div>
                    <div className="text-xs font-light">
                      <Tooltip
                        tooltipText={t(`uploader.${group}ColumnsTooltip`)}
                      >
                        <InformationCircleIcon className="text-hello-csv-text-muted size-5" />
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
}
