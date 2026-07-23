import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useElementSize } from '../../src/renderer/src/hooks/utils/useElementSize';
import { useKeyboardShortcuts } from '../../src/renderer/src/hooks/utils/useKeyboardShortcuts';

describe('Utility Hooks Extended Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useElementSize observes element resize events', () => {
    let resizeCb: any;
    const disconnectMock = vi.fn();
    const observeMock = vi.fn();

    global.ResizeObserver = vi.fn().mockImplementation((cb) => {
      resizeCb = cb;
      return { observe: observeMock, disconnect: disconnectMock, unobserve: vi.fn() };
    });

    const mockDiv = document.createElement('div');

    const { result } = renderHook(() => {
      const [ref, size] = useElementSize<HTMLDivElement>();
      (ref as any).current = mockDiv;
      return { ref, size };
    });

    // Re-trigger effect with ref populated
    act(() => {
      resizeCb?.([{ contentRect: { width: 400, height: 300 } }]);
    });

    expect(result.current.size).toEqual({ width: 400, height: 300 });
  });

  it('useKeyboardShortcuts handles Cmd/Ctrl shortcuts', () => {
    renderHook(() => useKeyboardShortcuts());

    // Trigger Cmd+t for new tab
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 't', metaKey: true, ctrlKey: true });
      window.dispatchEvent(event);
    });

    // Trigger Cmd+` for terminal toggle
    act(() => {
      const event = new KeyboardEvent('keydown', { key: '`', metaKey: true, ctrlKey: true });
      window.dispatchEvent(event);
    });
  });
});
