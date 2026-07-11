import type { NativeThumbnail } from '@shared/types/native';

export class ThumbnailLruCache {
  private readonly entries = new Map<string, NativeThumbnail>();

  constructor(private readonly capacity = 256) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new Error('Thumbnail cache capacity must be a positive integer');
  }

  get(key: string): NativeThumbnail | undefined {
    const value = this.entries.get(key);
    if (value === undefined) return undefined;
    this.entries.delete(key);
    this.entries.set(key, value);
    return value;
  }

  set(key: string, value: NativeThumbnail): void {
    this.entries.delete(key);
    this.entries.set(key, value);
    while (this.entries.size > this.capacity) {
      const oldestKey = this.entries.keys().next().value as string | undefined;
      if (oldestKey === undefined) break;
      this.entries.delete(oldestKey);
    }
  }

  clear(): void {
    this.entries.clear();
  }

  get size(): number {
    return this.entries.size;
  }
}
