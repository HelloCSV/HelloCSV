import { ImportStatistics } from '../../types';
import { Card } from '../../components';
import SummaryInfo from './SummaryInfo';
import { useTranslations } from '../../i18';

interface Props {
  statistics?: ImportStatistics;
  completedWithErrors?: boolean;
}

export default function Summary({ statistics, completedWithErrors }: Props) {
  const { t } = useTranslations();

  return (
    <Card withPadding={false} className="h-full">
      <div className="flex flex-col py-5">
        <div className="px-4 pb-2 text-xl">
          {t('importStatus.importDetails')}
        </div>
        <div className="px-4 pb-2 text-sm text-gray-500">
          {t('importStatus.importDetailsDescription')}
        </div>
        <div className="border-b border-gray-200 pb-2"></div>
        <SummaryInfo
          statistics={statistics}
          completedWithErrors={completedWithErrors}
        />
      </div>
    </Card>
  );
}
