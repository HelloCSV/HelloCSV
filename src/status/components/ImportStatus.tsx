import { ImporterMode } from '../../importer/types';
import Completed from './Completed';
import Failed from './Failed';
import Uploading from './Uploading';
import { ImportStatistics, SheetDefinition, SheetState } from '../../types';

type Mode = Extract<ImporterMode, 'submit' | 'failed' | 'completed'>;

interface Props {
  progress: number;
  mode: Mode;
  onRetry: () => void;
  onBackToPreview: () => void;
  resetState: () => void;
  sheetData: SheetState[];
  sheetDefinitions: SheetDefinition[];
  statistics?: ImportStatistics;
  rowFile?: File;
  onSummaryFinished?: () => void;
}

export default function ImportStatus({
  progress,
  mode,
  sheetData,
  sheetDefinitions,
  onRetry,
  onBackToPreview,
  resetState,
  statistics,
  rowFile,
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
          sheetData={sheetData}
          sheetDefinitions={sheetDefinitions}
          onRetry={onRetry}
          onBackToPreview={onBackToPreview}
          rowFile={rowFile}
        />
      )}

      {mode === 'completed' && (
        <Completed
          mode={mode}
          sheetData={sheetData}
          sheetDefinitions={sheetDefinitions}
          statistics={statistics}
          rowFile={rowFile}
          resetState={resetState}
          onSummaryFinished={onSummaryFinished}
        />
      )}
    </div>
  );
}
