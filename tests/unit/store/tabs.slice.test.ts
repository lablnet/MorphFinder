import { describe, expect, it } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { createTabsSlice } from '../../../src/renderer/src/store/tabs.slice';
import { createLayoutSlice } from '../../../src/renderer/src/store/layout.slice';
import type { AppStore } from '../../../src/renderer/src/store';

describe('tabs slice', () => {
  const setupStore = () =>
    createStore<AppStore>((...a) => ({
      ...createLayoutSlice(...a),
      ...createTabsSlice(...a),
    } as AppStore));

  it('starts with empty tabs', () => {
    const store = setupStore();
    expect(store.getState().tabs).toHaveLength(0);
    expect(store.getState().activeTabId).toBeNull();
  });

  it('opens a new tab and sets activeTabId', () => {
    const store = setupStore();
    const id = store.getState().openTab('/Users/test/Documents');

    expect(store.getState().tabs).toHaveLength(1);
    expect(store.getState().activeTabId).toBe(id);
    expect(store.getState().tabs[0].path).toBe('/Users/test/Documents');
  });

  it('navigates active tab and pushes back history', () => {
    const store = setupStore();
    const id = store.getState().openTab('/Users/test/Home');
    store.getState().navigateActiveTab('/Users/test/Documents');

    const tab = store.getState().activeTab();
    expect(tab?.path).toBe('/Users/test/Documents');
    expect(tab?.history.back).toEqual(['/Users/test/Home']);
  });

  it('supports goBack and goForward navigation', () => {
    const store = setupStore();
    const id = store.getState().openTab('/Users/test/Home');
    store.getState().navigateActiveTab('/Users/test/Documents');

    store.getState().goBack(id);
    expect(store.getState().activeTab()?.path).toBe('/Users/test/Home');
    expect(store.getState().activeTab()?.history.forward).toEqual(['/Users/test/Documents']);

    store.getState().goForward(id);
    expect(store.getState().activeTab()?.path).toBe('/Users/test/Documents');
  });

  it('closes a tab and activates neighboring tab', () => {
    const store = setupStore();
    const id1 = store.getState().openTab('/path/1');
    const id2 = store.getState().openTab('/path/2');

    expect(store.getState().activeTabId).toBe(id2);

    store.getState().closeTab(id2);
    expect(store.getState().tabs).toHaveLength(1);
    expect(store.getState().activeTabId).toBe(id1);
  });
});
