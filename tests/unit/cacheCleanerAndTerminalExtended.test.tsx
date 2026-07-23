import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { CacheCleaner } from '../../src/renderer/src/components/cachecleaner/CacheCleaner';
import { TerminalPanel } from '../../src/renderer/src/components/terminal/TerminalPanel';
import { useAppStore } from '../../src/renderer/src/store';

vi.mock('../../src/renderer/src/services/ipc', () => ({
  ipc: {
    invoke: vi.fn().mockImplementation((channel) => {
      if (channel === 'cache:scan') {
        return Promise.resolve({
          items: [
            { id: 'c1', label: 'System Logs', category: 'logs', path: '/tmp/logs', sizeBytes: 1048576, count: 5 },
          ],
          totalSizeBytes: 1048576,
        });
      }
      return Promise.resolve({});
    }),
    on: vi.fn().mockReturnValue(() => {}),
  },
}));

describe('Cache Cleaner & Terminal Components Extended Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  it('renders CacheCleaner', () => {
    render(<CacheCleaner />);
  });

  it('renders TerminalPanel when open', () => {
    useAppStore.setState({ terminalOpen: true });
    render(<TerminalPanel />);
    expect(screen.getByText(/Console Shell/i)).toBeDefined();
  });
});
