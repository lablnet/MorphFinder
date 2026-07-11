import { FileTimelineItem } from './FileTimelineItem';
import type { groupTimelineItems } from '@renderer/lib/fileTimelineUtils';

export function FileTimelineList({
  groups,
  onOpen,
}: {
  groups: ReturnType<typeof groupTimelineItems>;
  onOpen: (path: string) => void;
}): React.JSX.Element {
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.key}>
          <div className="sticky top-0 z-10 border-b border-shell-border bg-shell-surface/95 py-2 text-xs font-bold uppercase tracking-wide text-current/45 backdrop-blur">
            {group.label}
          </div>
          <div className="mt-2 space-y-1">{group.items.map((item) => <FileTimelineItem key={item.path} item={item} onOpen={onOpen} />)}</div>
        </section>
      ))}
    </div>
  );
}
