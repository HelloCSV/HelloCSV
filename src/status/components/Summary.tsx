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
    <Card withPadding={false} className="h-full">
      <div className="flex flex-col py-5">
        <div className="px-4 pb-2 text-xl">
          {t('importStatus.importDetails')}
        </div>
        <div className="text-hello-csv-text-muted px-4 pb-2 text-sm">
          {t('importStatus.importDetailsDescription')}
        </div>
        <div className="border-hello-csv-border border-b pb-2"></div>
        <SummaryInfo
          completedWithErrors={completedWithErrors}
          enumLabelDict={enumLabelDict}
        />
      </div>
    </Card>
  );
}
