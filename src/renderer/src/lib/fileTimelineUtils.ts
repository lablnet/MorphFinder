import type { FileTimelineItem } from '@shared/types/fileTimeline';
import type { FileSystemNode } from '@shared/types/fileSystem';

export const timelineDayOptions = [1, 3, 7, 14, 30] as const;

export function groupTimelineItems(items: FileTimelineItem[]): Array<{ key: string; label: string; items: FileTimelineItem[] }> {
  const groups = new Map<string, FileTimelineItem[]>();
  for (const item of items) {
    const key = new Date(item.eventAt).toDateString();
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.entries()].map(([key, groupedItems]) => ({
    key,
    label: dayLabel(groupedItems[0]?.eventAt ?? Date.now()),
    items: groupedItems,
  }));
}

export function timelineEventTime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(timestamp));
}

export function timelineFileNode(item: FileTimelineItem): FileSystemNode {
  return {
    path: item.path,
    name: item.name,
    kind: 'file',
    sizeInBytes: item.sizeInBytes,
    modifiedAt: item.modifiedAt,
    createdAt: item.createdAt,
    isHidden: item.name.startsWith('.'),
    extension: item.extension,
  };
}

function dayLabel(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}
