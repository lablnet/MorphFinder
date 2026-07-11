import { describe, expect, it } from 'vitest';
import { computeTreemapLayout } from '../../src/renderer/src/lib/treemapLayout';

describe('computeTreemapLayout', () => {
  it('returns empty array when children list is empty', () => {
    const rects = computeTreemapLayout([], 100, 800, 600);
    expect(rects).toEqual([]);
  });

  it('returns empty array when width or height is 0', () => {
    const children = [{ name: 'a', path: '/a', size: 100, isDirectory: false, fileCount: 0 }];
    expect(computeTreemapLayout(children, 100, 0, 600)).toEqual([]);
    expect(computeTreemapLayout(children, 100, 800, 0)).toEqual([]);
  });

  it('lays out elements proportionally to their size', () => {
    const children = [
      { name: 'big', path: '/big', size: 60, isDirectory: false, fileCount: 0 },
      { name: 'small', path: '/small', size: 40, isDirectory: false, fileCount: 0 },
    ];

    // Width = 100, Height = 100.
    // Total size = 100.
    // Width > Height -> horizontal split (vertical split line).
    // Node 'big' gets width = 60, height = 100, x = 0, y = 0.
    // Node 'small' gets width = 40, height = 100, x = 60, y = 0.
    const rects = computeTreemapLayout(children, 100, 100, 100);

    expect(rects).toHaveLength(2);
    expect(rects[0]).toMatchObject({
      name: 'big',
      x: 0,
      y: 0,
      width: 60,
      height: 100,
      percentage: 60,
    });
    expect(rects[1]).toMatchObject({
      name: 'small',
      x: 60,
      y: 0,
      width: 40,
      height: 100,
      percentage: 40,
    });
  });
});
