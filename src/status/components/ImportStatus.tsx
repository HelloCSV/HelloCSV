import { ImporterMode } from '../../importer/types';
import { useTranslations } from '../../i18';
import Completed from './Completed';
import Failed from './Failed';
import { ImportStatistics, SheetState } from '../../types';

type Mode = Extract<ImporterMode, 'submit' | 'failed' | 'completed'>;

interface Props {
  progress: number;
  mode: Mode;
  onRetry: () => void;
  onBackToPreview: () => void;
  resetState: () => void;
  sheetData: SheetState[];
  columnMappings: ColumnMapping[];
  importStatistics?: ImportStatistics;
  rowFile?: File;
}

export default function ImportStatus({
  progress,
  mode,
  sheetData,
  columnMappings,
  onRetry,
  onBackToPreview,
  resetState,
  importStatistics,
  rowFile,
}: Props) {
  const { t } = useTranslations();

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="text-2xl">Data import</div>
      <div className="flex flex-col space-y-4">
        <div>
          {mode === 'failed' && (
            <Failed
              mode={mode}
              sheetData={sheetData}
              importStatistics={importStatistics}
            />
          )}
          {mode === 'completed' && (
            <Completed
              mode={mode}
              sheetData={sheetData}
              importStatistics={importStatistics}
              rowFile={rowFile}
            />
          )}
        </div>
      </div>
    </div>
  );
}
