import { randomUUID } from 'node:crypto';

Object.defineProperty(globalThis, 'crypto', {
  value: { randomUUID },
  configurable: true,
});

class MemoryStorage implements Storage {
  private readonly entries = new Map<string, string>();

  get length(): number {
    return this.entries.size;
  }

  clear(): void {
    this.entries.clear();
  }

  getItem(key: string): string | null {
    return this.entries.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.entries.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.entries.delete(key);
  }

  setItem(key: string, value: string): void {
    this.entries.set(key, value);
  }
}

const memoryStorage = new MemoryStorage();

Object.defineProperty(globalThis, 'window', {
  value: {
    navigator: {
      platform: 'MacIntel',
    },
    localStorage: memoryStorage,
  },
  configurable: true,
});

Object.defineProperty(globalThis, 'localStorage', {
  value: memoryStorage,
  configurable: true,
});
