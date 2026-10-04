import { EnumLabelDict } from '@/types';
import { Card } from '@/components';
import SummaryInfo from './SummaryInfo';
import { useTranslations } from '@/i18';

interface Props {
  completedWithErrors?: boolean;
  enumLabelDict: EnumLabelDict;
}

export default function Summary({ completedWithErrors, enumLabelDict }: Props) {
  const { t } = useTranslations();

  return (
    <Card withPadding={false} className="hc:h-full">
      <div className="hc:flex hc:flex-col hc:py-5">
        <div className="hc:px-4 hc:pb-2 hc:text-xl">
          {t('importStatus.importDetails')}
        </div>
        <div className="hc:text-hello-csv-text-muted hc:px-4 hc:pb-2 hc:text-sm">
          {t('importStatus.importDetailsDescription')}
        </div>
        <div className="hc:border-hello-csv-border hc:border-b hc:pb-2"></div>
        <SummaryInfo
          completedWithErrors={completedWithErrors}
          enumLabelDict={enumLabelDict}
        />
      </div>
    </Card>
  );
}
