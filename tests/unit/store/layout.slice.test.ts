import { describe, expect, it } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { createLayoutSlice } from '../../../src/renderer/src/store/layout.slice';
import { createTabsSlice } from '../../../src/renderer/src/store/tabs.slice';
import type { AppStore } from '../../../src/renderer/src/store';

describe('layout slice', () => {
  const setupStore = () =>
    createStore<AppStore>((...a) => ({
      ...createTabsSlice(...a),
      ...createLayoutSlice(...a),
    } as AppStore));

  it('has initial default values', () => {
    const store = setupStore();
    expect(store.getState().showHiddenFiles).toBe(false);
    expect(store.getState().terminalOpen).toBe(false);
    expect(store.getState().themeMode).toBe('system');
  });

  it('toggles hidden files option', () => {
    const store = setupStore();
    store.getState().toggleHiddenFiles();
    expect(store.getState().showHiddenFiles).toBe(true);

    store.getState().toggleHiddenFiles();
    expect(store.getState().showHiddenFiles).toBe(false);
  });

  it('cycles shell between finder, explorer, and dolphin', () => {
    const store = setupStore();
    expect(store.getState().activeShell).toBeDefined();

    store.getState().setShell('finder');
    expect(store.getState().activeShell).toBe('finder');

    store.getState().cycleShell();
    expect(store.getState().activeShell).toBe('explorer');

    store.getState().cycleShell();
    expect(store.getState().activeShell).toBe('dolphin');

    store.getState().cycleShell();
    expect(store.getState().activeShell).toBe('finder');
  });

  it('toggles terminal state and queued commands', () => {
    const store = setupStore();
    store.getState().toggleTerminal();
    expect(store.getState().terminalOpen).toBe(true);

    store.getState().queueTerminalCommand('/Users/test', 'ls -la');
    expect(store.getState().terminalQueuedCommand).toMatchObject({
      cwd: '/Users/test',
      command: 'ls -la',
    });

    store.getState().clearTerminalQueuedCommand();
    expect(store.getState().terminalQueuedCommand).toBeNull();
  });

  it('pins and unpins folders', () => {
    const store = setupStore();
    store.getState().pinFolder('/Users/test/Documents');
    expect(store.getState().pinnedFolders).toContain('/Users/test/Documents');

    // Duplicate pin should be ignored
    store.getState().pinFolder('/Users/test/Documents');
    expect(store.getState().pinnedFolders).toHaveLength(1);

    store.getState().unpinFolder('/Users/test/Documents');
    expect(store.getState().pinnedFolders).not.toContain('/Users/test/Documents');
  });
});
