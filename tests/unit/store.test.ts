import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '@renderer/store';

const initialState = useAppStore.getInitialState();

describe('app store slices', () => {
  beforeEach(() => {
    useAppStore.setState(initialState, true);
  });

  it('opens tabs with shell defaults and activates by default', () => {
    const id = useAppStore.getState().openTab('/Users/alice/Documents');
    const state = useAppStore.getState();

    expect(state.activeTabId).toBe(id);
    expect(state.tabs).toHaveLength(1);
    expect(state.tabs[0]).toMatchObject({
      id,
      path: '/Users/alice/Documents',
      title: 'Documents',
      viewMode: 'icons',
      history: { back: [], forward: [] },
    });
  });

  it('keeps the current tab active when opening a background tab', () => {
    const firstId = useAppStore.getState().openTab('/Users/alice');
    const secondId = useAppStore.getState().openTab('/tmp', { activate: false });

    expect(useAppStore.getState().activeTabId).toBe(firstId);
    expect(useAppStore.getState().tabs.map((tab) => tab.id)).toEqual([firstId, secondId]);
  });

  it('tracks back and forward history per tab', () => {
    const id = useAppStore.getState().openTab('/Users/alice');

    useAppStore.getState().navigateActiveTab('/Users/alice/Documents');
    useAppStore.getState().navigateActiveTab('/Users/alice/Downloads');
    useAppStore.getState().goBack(id);
    useAppStore.getState().goForward(id);

    expect(useAppStore.getState().tabs[0]).toMatchObject({
      path: '/Users/alice/Downloads',
      history: { back: ['/Users/alice', '/Users/alice/Documents'], forward: [] },
    });
  });

  it('moves focus to the neighboring tab when closing the active tab', () => {
    const firstId = useAppStore.getState().openTab('/one');
    const secondId = useAppStore.getState().openTab('/two');
    const thirdId = useAppStore.getState().openTab('/three');

    useAppStore.getState().activateTab(secondId);
    useAppStore.getState().closeTab(secondId);

    expect(useAppStore.getState().activeTabId).toBe(thirdId);
    expect(useAppStore.getState().tabs.map((tab) => tab.id)).toEqual([firstId, thirdId]);
  });

  it('switches active shell and updates only the active tab view mode', () => {
    const firstId = useAppStore.getState().openTab('/one');
    const secondId = useAppStore.getState().openTab('/two');

    useAppStore.getState().setActiveTabViewMode('columns');
    useAppStore.getState().activateTab(firstId);
    useAppStore.getState().setShell('explorer');

    expect(useAppStore.getState().activeShell).toBe('explorer');
    expect(useAppStore.getState().tabs).toEqual([
      expect.objectContaining({ id: firstId, viewMode: 'list' }),
      expect.objectContaining({ id: secondId, viewMode: 'columns' }),
    ]);
  });

  it('stores selection and anchors per tab without leaking across tabs', () => {
    const firstId = useAppStore.getState().openTab('/one');
    const secondId = useAppStore.getState().openTab('/two');

    useAppStore.getState().setSelection(firstId, ['/one/a'], '/one/a');
    useAppStore.getState().setSelection(secondId, ['/two/b'], '/two/b');
    useAppStore.getState().clearSelection(firstId);

    expect(useAppStore.getState().selectionFor(firstId)).toEqual([]);
    expect(useAppStore.getState().selectionFor(secondId)).toEqual(['/two/b']);
    expect(useAppStore.getState().anchorPathByTab[secondId]).toBe('/two/b');
  });
});
