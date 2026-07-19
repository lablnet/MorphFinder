import { useState } from 'react';
import { FileTimelineControls } from './components/FileTimelineControls';
import { FileTimelineEmptyState } from './components/FileTimelineEmptyState';
import { FileTimelineHeader } from './components/FileTimelineHeader';
import { FileTimelineList } from './components/FileTimelineList';
import { FileTimelineStats } from './components/FileTimelineStats';
import { FolderPickerDialog } from '@renderer/components/folderpicker/FolderPickerDialog';
import { useFileTimeline } from '@renderer/hooks/files/useFileTimeline';

export function FileTimeline({
  initialRootPath,
  onOpenPath,
}: {
  initialRootPath: string | null;
  onOpenPath: (path: string) => void;
}): React.JSX.Element {
  const timeline = useFileTimeline(initialRootPath);
  const [isFolderPickerOpen, setIsFolderPickerOpen] = useState(false);
  const hasItems = timeline.groups.length > 0;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-shell-surface text-sm">
      <FileTimelineHeader
        rootPath={timeline.rootPath}
        isLoading={timeline.isLoading}
        onChooseFolder={() => setIsFolderPickerOpen(true)}
        onScan={() => void timeline.scan()}
      />
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <FileTimelineControls days={timeline.days} disabled={timeline.isLoading} onDaysChange={timeline.setDays} />
        {timeline.error !== null ? (
          <div className="mb-4 rounded-shell border border-shell-border bg-shell-sidebar/40 p-3 text-xs text-current/70">{timeline.error}</div>
        ) : null}
        <FileTimelineStats result={timeline.result} />
        {hasItems ? <FileTimelineList groups={timeline.groups} onOpen={onOpenPath} /> : <FileTimelineEmptyState isLoading={timeline.isLoading} />}
      </div>
      {isFolderPickerOpen ? (
        <FolderPickerDialog
          title="Choose Timeline Folder"
          initialPath={timeline.rootPath}
          onClose={() => setIsFolderPickerOpen(false)}
          onChoose={(path) => {
            setIsFolderPickerOpen(false);
            void timeline.chooseFolder(path);
          }}
        />
      ) : null}
    </div>
  );
}
