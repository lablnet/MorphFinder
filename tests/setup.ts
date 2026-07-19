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

if (typeof window !== 'undefined') {
  Object.defineProperty(window.navigator, 'platform', {
    value: 'MacIntel',
    configurable: true,
  });
  Object.defineProperty(window, 'localStorage', {
    value: memoryStorage,
    configurable: true,
  });
  Object.defineProperty(window, 'morph', {
    value: {
      invoke: async () => ({}),
      on: () => () => {},
    },
    configurable: true,
  });
}

Object.defineProperty(globalThis, 'localStorage', {
  value: memoryStorage,
  configurable: true,
});

// ---------------------------------------------------------------------------
// Suppress known benign stderr noise from the test suite.
// These are intentional patterns that do NOT indicate test failures:
//
//  1. React act() warnings — async state updates that happen outside act()
//     in integration-style hook tests. Tests still pass.
//  2. Service error-path logs — e.g. getDiskSpace calling `df` on mock paths
//     that don't exist on disk. The service catches the error gracefully.
//
// Any console.error message that does NOT match these patterns is still
// forwarded to the original implementation so real failures remain visible.
// ---------------------------------------------------------------------------
const _originalConsoleError = console.error.bind(console);

const SUPPRESSED_PATTERNS = [
  // React Testing Library act() warning
  /not wrapped in act\(\.\.\.\)/,
  // spaceAnalyzerService getDiskSpace failure log
  /Failed to get disk space/,
  // useSpaceAnalyzer hook error-path log (test deliberately injects an error)
  /Space Analyzer scan failed/,
  // react-dom missing aria-describedby on DialogContent (radix-ui cosmetic)
  /Missing `Description` or `aria-describedby/,
  // jsdom canvas not implemented warning
  /not implemented.*getContext/i,
];

console.error = (...args: unknown[]): void => {
  const message = args[0] != null ? String(args[0]) : '';
  if (SUPPRESSED_PATTERNS.some((pattern) => pattern.test(message))) return;
  _originalConsoleError(...args);
};
