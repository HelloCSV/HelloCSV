import Completed from './Completed';
import Failed from './Failed';
import Uploading from './Uploading';
import { useImporterState } from '@/importer/reducer';

interface Props {
  onRetry: () => void;
  onBackToPreview: () => void;
  resetState: () => void;
}

export default function ImportStatus({
  onRetry,
  onBackToPreview,
  resetState,
}: Props) {
  const { mode } = useImporterState();

  return (
    <div className="h-full">
      {mode === 'submit' && <Uploading resetState={resetState} />}

      {mode === 'failed' && (
        <Failed onRetry={onRetry} onBackToPreview={onBackToPreview} />
      )}

      {mode === 'completed' && <Completed resetState={resetState} />}
    </div>
  );
}
