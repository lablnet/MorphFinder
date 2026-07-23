import { describe, expect, it } from 'vitest';
import {
  timelineDayOptions,
  groupTimelineItems,
  timelineEventTime,
  timelineFileNode,
} from '@renderer/lib/fileTimelineUtils';
import type { FileTimelineItem } from '@shared/types/fileTimeline';

describe('fileTimelineUtils', () => {
  it('defines valid timeline day options', () => {
    expect(timelineDayOptions).toEqual([1, 3, 7, 14, 30]);
  });

  describe('groupTimelineItems', () => {
    it('groups items by date string', () => {
      const now = Date.now();
      const yesterday = now - 24 * 60 * 60 * 1000;
      const items: FileTimelineItem[] = [
        {
          path: '/file1.txt',
          name: 'file1.txt',
          extension: 'txt',
          sizeInBytes: 100,
          eventAt: now,
          modifiedAt: now,
          createdAt: now,
          action: 'modified',
        },
        {
          path: '/file2.txt',
          name: 'file2.txt',
          extension: 'txt',
          sizeInBytes: 200,
          eventAt: yesterday,
          modifiedAt: yesterday,
          createdAt: yesterday,
          action: 'created',
        },
      ];

      const groups = groupTimelineItems(items);
      expect(groups).toHaveLength(2);
      expect(groups[0].label).toBe('Today');
      expect(groups[1].label).toBe('Yesterday');
    });
  });

  describe('timelineEventTime', () => {
    it('formats event timestamp to localized time string', () => {
      const timestamp = new Date('2026-01-01T15:30:00Z').getTime();
      const result = timelineEventTime(timestamp);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('timelineFileNode', () => {
    it('maps FileTimelineItem to FileSystemNode', () => {
      const item: FileTimelineItem = {
        path: '/a/b.js',
        name: 'b.js',
        extension: 'js',
        sizeInBytes: 500,
        eventAt: 1600000000000,
        modifiedAt: 1600000000000,
        createdAt: 1600000000000,
        action: 'modified',
      };
      const node = timelineFileNode(item);
      expect(node).toEqual({
        path: '/a/b.js',
        name: 'b.js',
        kind: 'file',
        sizeInBytes: 500,
        modifiedAt: 1600000000000,
        createdAt: 1600000000000,
        isHidden: false,
        extension: 'js',
      });
    });
  });
});
