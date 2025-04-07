import { ImporterMode } from '../../importer/types';
import Completed from './Completed';
import Failed from './Failed';
import Uploading from './Uploading';
import { ImportStatistics, SheetState } from '../../types';

type Mode = Extract<ImporterMode, 'submit' | 'failed' | 'completed'>;

interface Props {
  progress: number;
  mode: Mode;
  onRetry: () => void;
  onBackToPreview: () => void;
  resetState: () => void;
  sheetData: SheetState[];
  importStatistics?: ImportStatistics;
  rowFile?: File;
}

export default function ImportStatus({
  progress,
  mode,
  sheetData,
  onRetry,
  onBackToPreview,
  resetState,
  importStatistics,
  rowFile,
}: Props) {
  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="text-2xl">Data import</div>
      <div className="flex flex-col space-y-4">
        <div>
          {mode === 'submit' && (
            <Uploading
              progress={progress}
              mode={mode}
              resetState={resetState}
            />
          )}

          {mode === 'failed' && (
            <Failed onRetry={onRetry} onBackToPreview={onBackToPreview} />
          )}

          {mode === 'completed' && (
            <Completed
              mode={mode}
              sheetData={sheetData}
              importStatistics={importStatistics}
              rowFile={rowFile}
              resetState={resetState}
            />
          )}
        </div>
      </div>
    </div>
  );
}
