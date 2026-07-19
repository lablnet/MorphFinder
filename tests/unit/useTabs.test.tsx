import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTabs } from '@renderer/hooks/ui/useTabs';
import { useAppStore } from '@renderer/store';

describe('useTabs', () => {
  it('exposes active tab properties and history controls', () => {
    useAppStore.setState({
      wellKnownDirs: { home: '/Users/test', desktop: '/Desktop', documents: '/Docs', downloads: '/Dl' },
      tabs: [
        {
          id: 'tab-1',
          path: '/Users/test',
          title: 'Home',
          history: { back: ['/'], forward: ['/Users/test/Docs'] },
        },
      ],
      activeTabId: 'tab-1',
    });

    const { result } = renderHook(() => useTabs());

    expect(result.current.all).toHaveLength(1);
    expect(result.current.activeId).toBe('tab-1');
    expect(result.current.activePath).toBe('/Users/test');
    expect(result.current.canGoBack).toBe(true);
    expect(result.current.canGoForward).toBe(true);

    act(() => {
      result.current.openHome();
    });

    expect(result.current.all.length).toBeGreaterThan(1);
  });
});
