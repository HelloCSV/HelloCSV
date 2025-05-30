import {
  ImporterMode,
  ImportStatistics,
  SheetState,
  EnumLabelDict,
} from '../../types';
import { Card } from '../../components';
import SummaryInfo from './SummaryInfo';
import { useTranslations } from '../../i18';

type Mode = Extract<ImporterMode, 'failed' | 'completed'>;

interface Props {
  mode: Mode;
  sheetData: SheetState[];
  statistics?: ImportStatistics;
  rowFile?: File;
  completedWithErrors?: boolean;
  enumLabelDict: EnumLabelDict;
}

export default function Summary({
  mode,
  sheetData,
  statistics,
  rowFile,
  completedWithErrors,
  enumLabelDict,
}: Props) {
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
          mode={mode}
          sheetData={sheetData}
          statistics={statistics}
          rowFile={rowFile}
          completedWithErrors={completedWithErrors}
          enumLabelDict={enumLabelDict}
        />
      </div>
    </Card>
  );
}
