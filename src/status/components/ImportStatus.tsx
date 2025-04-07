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
  statistics?: ImportStatistics;
  rowFile?: File;
}

export default function ImportStatus({
  progress,
  mode,
  sheetData,
  onRetry,
  onBackToPreview,
  resetState,
  statistics,
  rowFile,
}: Props) {
  return (
    <div className="flex h-full flex-col space-y-4">
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
            <Failed
              mode={mode}
              onRetry={onRetry}
              onBackToPreview={onBackToPreview}
              rowFile={rowFile}
              sheetData={sheetData}
            />
          )}

          {mode === 'completed' && (
            <Completed
              mode={mode}
              sheetData={sheetData}
              statistics={statistics}
              rowFile={rowFile}
              resetState={resetState}
            />
          )}
        </div>
      </div>
    </div>
  );
}
