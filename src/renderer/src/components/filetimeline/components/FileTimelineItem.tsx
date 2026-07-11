import { GitCommitHorizontal } from 'lucide-react';
import { FileIcon } from '@renderer/components/fileicons/FileIcon';
import { formatBytes, formatModifiedDate } from '@renderer/lib/format';
import { timelineEventTime, timelineFileNode } from '@renderer/lib/fileTimelineUtils';
import type { FileTimelineItem as TimelineItem } from '@shared/types/fileTimeline';

export function FileTimelineItem({ item, onOpen }: { item: TimelineItem; onOpen: (path: string) => void }): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onOpen(item.path)}
      className="flex w-full items-center gap-3 rounded-shell px-3 py-2 text-left hover:bg-shell-sidebar"
    >
      <div className="w-16 shrink-0 text-xs font-medium text-current/45">{timelineEventTime(item.eventAt)}</div>
      <FileIcon node={timelineFileNode(item)} size={20} className="shrink-0 text-current/70" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-current">{item.name}</span>
          <span className="rounded bg-shell-accent/10 px-1.5 py-0.5 text-[10px] font-semibold capitalize text-shell-accent">{item.eventKind}</span>
          {item.gitStatus !== undefined ? (
            <span className="flex items-center gap-1 rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-green-600">
              <GitCommitHorizontal size={10} />
              {item.gitStatus}
            </span>
          ) : null}
        </div>
        <div className="truncate text-xs text-current/45">{item.path}</div>
      </div>
      <div className="shrink-0 text-right text-xs text-current/55">
        <div>{formatBytes(item.sizeInBytes)}</div>
        <div>{formatModifiedDate(item.modifiedAt)}</div>
      </div>
    </button>
  );
}
