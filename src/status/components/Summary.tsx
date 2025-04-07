import { ImporterMode } from '../../importer/types';
import { Card } from '../../components';
import SummaryInfo from './SummaryInfo';
import { SheetState, ImportStatistics } from '../../types';

type Mode = Extract<ImporterMode, 'failed' | 'completed'>;

interface Props {
  mode: Mode;
  sheetData: SheetState[];
  importStatistics?: ImportStatistics;
  rowFile?: File;
}

export default function Summary({
  mode,
  sheetData,
  importStatistics,
  rowFile,
}: Props) {
  return (
    <Card withPadding={false} className="h-full">
      <div className="flex flex-col py-5">
        <div className="px-4 pb-2 text-xl">Import summary</div>
        <div className="px-4 pb-2 text-sm text-gray-500">
          Details about your recent data import
        </div>
        <div className="border-b border-gray-200 pb-2"></div>
        <SummaryInfo
          mode={mode}
          sheetData={sheetData}
          importStatistics={importStatistics}
          rowFile={rowFile}
        />
      </div>
    </Card>
  );
}
