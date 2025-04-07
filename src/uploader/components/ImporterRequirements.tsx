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
    <div className="flex h-full flex-col space-y-5">
      <div className="me-3">
        <Alert variant="info" description={t('uploader.importerInformation')} />
      </div>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <RequirementsList importerRequirements={importerRequirements} />
      </div>
    </div>
  );
}
