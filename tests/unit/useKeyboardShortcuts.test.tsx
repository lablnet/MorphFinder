import { describe, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcuts } from '../../src/renderer/src/hooks/utils/useKeyboardShortcuts';
import { useAppStore } from '../../src/renderer/src/store';

describe('useKeyboardShortcuts Coverage', () => {
  it('handles keyboard shortcuts', () => {
    useAppStore.setState({
      activeTabId: 'tab1',
      tabs: [{ id: 'tab1', title: 'Home', path: '/home', history: { back: [], forward: [] } }],
    });

    renderHook(() => useKeyboardShortcuts());

    // Dispatch Meta + t
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 't', metaKey: true }));
    });

    // Dispatch Meta + .
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '.', metaKey: true }));
    });

    // Dispatch Meta + `
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '`', metaKey: true }));
    });

    // Dispatch Meta + Shift + u
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'u', metaKey: true, shiftKey: true }));
    });

    // Dispatch Meta + Tab
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', metaKey: true }));
    });
  });
});
