import { describe, expect, it } from 'vitest';
import { ThumbnailLruCache } from '../../src/main/services/thumbnailCache';

const thumbnail = (id: string) => ({ dataUrl: `data:image/png;base64,${id}`, width: 32, height: 32 });

describe('ThumbnailLruCache', () => {
  it('rejects invalid capacities', () => {
    expect(() => new ThumbnailLruCache(0)).toThrow(/positive integer/);
  });

  it('returns stored thumbnails and reports size', () => {
    const cache = new ThumbnailLruCache(2);
    cache.set('a', thumbnail('a'));
    expect(cache.get('a')).toEqual(thumbnail('a'));
    expect(cache.size).toBe(1);
  });

  it('evicts the least recently used thumbnail', () => {
    const cache = new ThumbnailLruCache(2);
    cache.set('a', thumbnail('a'));
    cache.set('b', thumbnail('b'));
    cache.get('a');
    cache.set('c', thumbnail('c'));
    expect(cache.get('a')).toBeDefined();
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('c')).toBeDefined();
  });

  it('replaces a key without growing and clears all entries', () => {
    const cache = new ThumbnailLruCache(2);
    cache.set('a', thumbnail('old'));
    cache.set('a', thumbnail('new'));
    expect(cache.size).toBe(1);
    expect(cache.get('a')).toEqual(thumbnail('new'));
    cache.clear();
    expect(cache.size).toBe(0);
  });
});
