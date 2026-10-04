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
    <div className="hc:h-full hc:w-full hc:space-y-5 hc:overflow-y-auto">
      {Object.entries(importerRequirements)
        .filter(([, requirements]) => requirements.length > 0)
        .map(([groupName, requirements]) => {
          const group = groupName === 'required' ? 'required' : 'optional';

          return (
            <div key={groupName} className="hc:me-3">
              <div className="hc:border-hello-csv-border hc:my-3 hc:border-b hc:pb-4 hc:text-sm hc:font-light hc:uppercase">
                {t(`uploader.${group}Columns`)}
              </div>
              <div className="hc:mt-4">
                {requirements.map((requirement) => (
                  <div
                    key={`${requirement.sheetId}-${requirement.columnId}`}
                    className="hc:my-3 hc:flex hc:justify-between"
                  >
                    <div className="hc:text-xs">{requirement.columnLabel}</div>
                    <div className="hc:text-xs hc:font-light">
                      <Tooltip
                        tooltipText={t(`uploader.${group}ColumnsTooltip`)}
                      >
                        <InformationCircleIcon className="hc:text-hello-csv-text-muted hc:size-5" />
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
