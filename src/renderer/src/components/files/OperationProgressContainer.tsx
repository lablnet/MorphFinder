import { useArchiveProgress, useFileOperationProgress } from '@renderer/hooks';
import { ArchiveProgressCard } from './ArchiveProgressCard';
import { FileOpProgressCard } from './FileOpProgressCard';

export function OperationProgressContainer() {
  const { archives, cancelArchive } = useArchiveProgress();
  const { fileOperations, cancelFileOp } = useFileOperationProgress();

  if (archives.length === 0 && fileOperations.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-h-[80vh] overflow-y-auto pr-1">
      {archives.map((item) => (
        <ArchiveProgressCard key={item.operationId} item={item} onCancel={cancelArchive} />
      ))}
      {fileOperations.map((item) => (
        <FileOpProgressCard key={item.operationId} item={item} onCancel={cancelFileOp} />
      ))}
    </div>
  );
}
