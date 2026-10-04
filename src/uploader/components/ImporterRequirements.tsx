import { ImporterRequirementsType } from '../../types';
import { Alert } from '../../components';
import { useTranslations } from '../../i18';
import RequirementsList from './RequirementsList';

interface Props {
  importerRequirements: ImporterRequirementsType;
}

export default function ImporterRequirements({ importerRequirements }: Props) {
  const { t } = useTranslations();

  return (
    <div className="hc:flex hc:h-full hc:flex-col hc:space-y-5">
      <div className="hc:me-3">
        <Alert variant="info" description={t('uploader.importerInformation')} />
      </div>
      <div className="hc:flex hc:min-h-0 hc:flex-1 hc:overflow-hidden">
        <RequirementsList importerRequirements={importerRequirements} />
      </div>
    </div>
  );
}
