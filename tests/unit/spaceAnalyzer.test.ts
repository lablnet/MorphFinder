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

  it('returns empty array when totalSize or totalRemainingSize is 0', () => {
    const children = [{ name: 'zero', path: '/zero', size: 0, isDirectory: false, fileCount: 0 }];
    expect(computeTreemapLayout(children, 0, 800, 600)).toEqual([]);
    expect(computeTreemapLayout(children, 100, 800, 600)).toEqual([]);
  });

  it('lays out elements proportionally to their size (horizontal split)', () => {
    const children = [
      { name: 'big', path: '/big', size: 60, isDirectory: false, fileCount: 0 },
      { name: 'small', path: '/small', size: 40, isDirectory: false, fileCount: 0 },
    ];

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

  it('splits vertically when container height is strictly greater than width', () => {
    const children = [
      { name: 'top', path: '/top', size: 50, isDirectory: false, fileCount: 0 },
      { name: 'bottom', path: '/bottom', size: 50, isDirectory: false, fileCount: 0 },
    ];

    const rects = computeTreemapLayout(children, 100, 100, 200);

    expect(rects).toHaveLength(2);
    expect(rects[0]).toMatchObject({
      name: 'top',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      percentage: 50,
    });
    expect(rects[1]).toMatchObject({
      name: 'bottom',
      x: 0,
      y: 100,
      width: 100,
      height: 100,
      percentage: 50,
    });
  });

  it('sorts children descending by size regardless of input order', () => {
    const children = [
      { name: 'small', path: '/small', size: 10, isDirectory: false, fileCount: 1 },
      { name: 'large', path: '/large', size: 90, isDirectory: false, fileCount: 5 },
    ];

    const rects = computeTreemapLayout(children, 100, 100, 100);
    expect(rects[0].name).toBe('large');
    expect(rects[1].name).toBe('small');
  });
});
