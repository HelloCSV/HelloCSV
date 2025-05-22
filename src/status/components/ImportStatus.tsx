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
  headers: string[];
  statistics?: ImportStatistics;
  rowFile?: File;
  onSummaryFinished?: () => void;
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
  headers,
  onSummaryFinished,
}: Props) {
  return (
    <div className="h-full">
      {mode === 'submit' && (
        <Uploading progress={progress} mode={mode} resetState={resetState} />
      )}

      {mode === 'failed' && (
        <Failed
          mode={mode}
          onRetry={onRetry}
          onBackToPreview={onBackToPreview}
          rowFile={rowFile}
          headers={headers}
          sheetData={sheetData}
        />
      )}

      {mode === 'completed' && (
        <Completed
          mode={mode}
          headers={headers}
          sheetData={sheetData}
          statistics={statistics}
          rowFile={rowFile}
          resetState={resetState}
          onSummaryFinished={onSummaryFinished}
        />
      )}
    </div>
  );
}
