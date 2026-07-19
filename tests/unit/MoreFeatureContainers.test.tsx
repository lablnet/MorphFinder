import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CacheCleaner } from '../../src/renderer/src/components/cachecleaner/CacheCleaner';
import { DevPanel } from '../../src/renderer/src/components/devpanel/DevPanel';
import { DependenciesPanel } from '../../src/renderer/src/components/devpanel/components/DependenciesPanel';
import { EnvVarsPanel } from '../../src/renderer/src/components/devpanel/components/EnvVarsPanel';
import { ScriptsPanel } from '../../src/renderer/src/components/devpanel/components/ScriptsPanel';
import { CommandPalette } from '../../src/renderer/src/components/navigation/CommandPalette';
import { OnboardingModal } from '../../src/renderer/src/components/onboarding/OnboardingModal';
import { WorkspaceSnapshotsModal } from '../../src/renderer/src/components/snapshots/WorkspaceSnapshotsModal';
import { TerminalPanel } from '../../src/renderer/src/components/terminal/TerminalPanel';
import { useAppStore } from '../../src/renderer/src/store';

const state = vi.hoisted(() => ({
  cache: {} as any,
  devPanel: {} as any,
  scanPath: { scanPath: '/repo', isPickingFolder: false, pickFolder: vi.fn(async () => undefined) },
  snapshots: {} as any,
  terminal: {} as any,
  commandPalette: {} as any,
}));

vi.mock('@renderer/hooks/files/useDevPanelScanPath', () => ({
  useDevPanelScanPath: vi.fn(() => state.scanPath),
}));

vi.mock('../../src/renderer/src/hooks/files/useDevPanel', () => ({
  useDevPanel: vi.fn(() => state.devPanel),
}));

vi.mock('../../src/renderer/src/hooks/files/useCacheCleaner', async () => {
  const actual = await vi.importActual<any>('../../src/renderer/src/hooks/files/useCacheCleaner');
  return {
    ...actual,
    useCacheCleaner: vi.fn(() => state.cache),
  };
});

vi.mock('../../src/renderer/src/hooks/snapshots/useWorkspaceSnapshots', () => ({
  useWorkspaceSnapshots: vi.fn(() => state.snapshots),
}));

vi.mock('../../src/renderer/src/hooks/ui/useTerminal', () => ({
  useTerminal: vi.fn(() => state.terminal),
}));

vi.mock('../../src/renderer/src/hooks/ui/useCommandPalette', () => ({
  useCommandPalette: vi.fn(() => state.commandPalette),
}));

vi.mock('../../src/renderer/src/components/terminal/components/TerminalContainer', () => ({
  TerminalContainer: ({ output, onData, onResize }: any) => (
    <div>
      <span>Terminal Body {output}</span>
      <button onClick={() => onData('pwd\n')}>send terminal data</button>
      <button onClick={() => onResize(100, 30)}>resize terminal</button>
    </div>
  ),
}));

const projectInfo = {
  path: '/repo',
  projectType: 'node',
  name: 'morphfinder',
  version: '1.0.0',
  description: 'File manager',
  license: 'MIT',
  toolchain: { runtime: 'node', requiredVersion: '>=20' },
  hasProject: true,
  packageManager: 'pnpm',
  scripts: [{ name: 'test', command: 'pnpm test' }],
  dependencies: [
    { name: 'react', version: '^19.0.0', isDev: false },
    { name: 'vitest', version: '^3.0.0', isDev: true },
  ],
  envVars: [
    { key: 'API_TOKEN', value: 'secret' },
    { key: 'EMPTY_VALUE', value: '' },
  ],
  envChecklist: [{ key: 'API_TOKEN', present: true, source: '.env.example' }],
  healthChecks: [{ id: 'pkg', label: 'Package file', status: 'pass', detail: 'package.json found' }],
  dependencyWarnings: [],
  gitBranch: 'main',
  gitIsDirty: false,
};

function resetState() {
  state.cache = {
    isSupported: true,
    targets: [{ id: 'npm', name: 'npm cache', path: '/cache/npm', sizeInBytes: 2048, category: 'Developer', description: 'npm' }],
    selectedIds: new Set(['npm']),
    scanning: false,
    cleaning: false,
    freedMessage: 'Freed 2 KB',
    errors: {},
    searchQuery: '',
    setSearchQuery: vi.fn(),
    sortBy: 'size',
    sortOrder: 'desc',
    showFirstConfirm: false,
    setShowFirstConfirm: vi.fn(),
    showSecondConfirm: false,
    setShowSecondConfirm: vi.fn(),
    progressState: null,
    performScan: vi.fn(async () => undefined),
    handleToggleSelect: vi.fn(),
    handleToggleSelectAll: vi.fn(),
    handleClean: vi.fn(async () => undefined),
    handleCancelClean: vi.fn(),
    toggleSort: vi.fn(),
    sortedTargets: [{ id: 'npm', name: 'npm cache', path: '/cache/npm', sizeInBytes: 2048, category: 'Developer', description: 'npm' }],
    totalScannedSize: 2048,
    totalSelectedSize: 2048,
    hasApplicationSupportSelected: true,
  };
  state.devPanel = {
    info: projectInfo,
    loading: false,
    error: null,
    activeTab: 'overview',
    setActiveTab: vi.fn(),
    revealedEnvKeys: new Set<string>(),
    favoriteScripts: new Set<string>(),
    scriptRunState: {},
    revealEnvKey: vi.fn(),
    runScript: vi.fn(async () => undefined),
    toggleFavoriteScript: vi.fn(),
    refresh: vi.fn(),
  };
  state.snapshots = {
    snapshots: [{ id: 'snap-1', name: 'Morning', description: 'before refactor', createdAt: Date.now(), shell: 'finder', tabs: [] }],
    isLoading: false,
    isModalOpen: true,
    closeModal: vi.fn(),
    saveCurrentWorkspace: vi.fn(async () => undefined),
    restoreSnapshot: vi.fn(),
    deleteSnapshot: vi.fn(),
    exportSnapshot: vi.fn(),
    importSnapshot: vi.fn(async () => undefined),
  };
  state.terminal = {
    isOpen: true,
    height: 260,
    output: 'ready',
    setHeight: vi.fn(),
    setOpen: vi.fn(),
    writeData: vi.fn(),
    resizeSession: vi.fn(),
    restart: vi.fn(async () => undefined),
  };
  state.commandPalette = {
    isOpen: true,
    searchQuery: '',
    setSearchQuery: vi.fn(),
    activeIndex: 0,
    filteredItems: [
      { id: 'open-home', label: 'Open Home', description: 'Go home', category: 'Navigation', icon: 'Home', action: vi.fn() },
      { id: 'file', label: 'file.ts', description: '/repo/file.ts', category: 'Files', icon: 'File', action: vi.fn() },
    ],
    selectIndex: vi.fn(),
    selectItem: vi.fn(),
    activeShell: 'finder',
    close: vi.fn(),
  };
  state.scanPath = { scanPath: '/repo', isPickingFolder: false, pickFolder: vi.fn(async () => undefined) };
  useAppStore.setState({ activeShell: 'finder' });
}

describe('more feature containers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetState();
  });

  it('renders cache cleaner and wires scan, search, sort, and clean actions', () => {
    render(<CacheCleaner />);

    expect(screen.getByText('Cache Cleaner Dashboard')).toBeDefined();
    expect(screen.getByText('Freed 2 KB')).toBeDefined();
    const targetRow = screen.getByText('npm cache').closest('.flex.items-start')!;
    fireEvent.click(targetRow.querySelector('button')!);
    fireEvent.change(screen.getByPlaceholderText(/search cache folders/i), { target: { value: 'npm' } });
    fireEvent.click(screen.getAllByRole('button')[0]!);
    fireEvent.click(screen.getByRole('button', { name: /target folder/i }));
    fireEvent.click(screen.getByRole('button', { name: /clean/i }));
    expect(state.cache.handleToggleSelect).toHaveBeenCalledWith('npm');
    expect(state.cache.setSearchQuery).toHaveBeenCalledWith('npm');
    expect(state.cache.performScan).toHaveBeenCalledTimes(1);
    expect(state.cache.toggleSort).toHaveBeenCalledWith('name');
    expect(state.cache.setShowFirstConfirm).toHaveBeenCalledWith(true);
  });

  it('renders dev panel states and switches overview cards', () => {
    const { rerender } = render(<DevPanel />);

    expect(screen.getByText('Dev Panel')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /^scripts$/i }));
    expect(state.devPanel.setActiveTab).toHaveBeenCalledWith('scripts');

    state.devPanel = { ...state.devPanel, loading: true };
    rerender(<DevPanel />);
    expect(screen.getByText(/scanning project/i)).toBeDefined();

    state.devPanel = { ...state.devPanel, loading: false, error: 'No package file' };
    rerender(<DevPanel />);
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(state.devPanel.refresh).toHaveBeenCalledTimes(1);

    state.devPanel = { ...state.devPanel, error: null, info: { ...projectInfo, hasProject: false } };
    rerender(<DevPanel />);
    expect(screen.getByText(/No project detected/i)).toBeDefined();
  });

  it('covers dev panel leaf panels', async () => {
    const run = vi.fn(async () => undefined);
    const { rerender } = render(<ScriptsPanel scripts={projectInfo.scripts} onRun={run} />);
    fireEvent.click(screen.getByTitle('Run: pnpm test'));
    await waitFor(() => expect(run).toHaveBeenCalledWith('pnpm test'));

    rerender(<DependenciesPanel dependencies={projectInfo.dependencies} />);
    fireEvent.click(screen.getByRole('button', { name: /dev1/i }));
    expect(screen.getByText('vitest')).toBeDefined();
    fireEvent.change(screen.getByPlaceholderText(/filter packages/i), { target: { value: 'missing' } });
    expect(screen.getByText('No packages match')).toBeDefined();

    const reveal = vi.fn();
    rerender(<EnvVarsPanel envVars={projectInfo.envVars} revealedKeys={new Set(['EMPTY_VALUE'])} onReveal={reveal} />);
    fireEvent.click(screen.getByTitle('Reveal value'));
    expect(reveal).toHaveBeenCalledWith('API_TOKEN');
    expect(screen.getByText('(empty)')).toBeDefined();
  });

  it('walks onboarding steps and closes on launch', () => {
    const onClose = vi.fn();
    render(<OnboardingModal isOpen onClose={onClose} />);

    fireEvent.click(screen.getByText('Windows 11 Explorer Shell'));
    expect(useAppStore.getState().activeShell).toBe('explorer');
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText('Next-Gen Power Suite')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.click(screen.getByRole('button', { name: /launch workspace/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders snapshots modal and runs import, save, restore, export, and delete', async () => {
    render(<WorkspaceSnapshotsModal />);

    fireEvent.click(screen.getByRole('button', { name: /import/i }));
    fireEvent.click(screen.getByRole('button', { name: /save current/i }));
    fireEvent.change(screen.getByPlaceholderText(/frontend refactor setup/i), { target: { value: 'Checkpoint' } });
    fireEvent.change(screen.getByPlaceholderText(/tab 1/i), { target: { value: 'Added tests' } });
    fireEvent.click(screen.getByRole('button', { name: /save snapshot/i }));
    await waitFor(() => expect(state.snapshots.saveCurrentWorkspace).toHaveBeenCalledWith('Checkpoint', 'Added tests'));

    fireEvent.click(screen.getByRole('button', { name: /restore session/i }));
    fireEvent.click(screen.getByRole('button', { name: /export snapshot/i }));
    fireEvent.click(screen.getByRole('button', { name: /delete snapshot/i }));
    expect(state.snapshots.restoreSnapshot).toHaveBeenCalledWith('snap-1');
    expect(state.snapshots.exportSnapshot).toHaveBeenCalledWith('snap-1');
    expect(state.snapshots.deleteSnapshot).toHaveBeenCalledWith('snap-1');
  });

  it('renders terminal panel and command palette interactions', () => {
    const { rerender } = render(<TerminalPanel />);
    expect(screen.getByText(/Terminal Body ready/i)).toBeDefined();
    fireEvent.click(screen.getByTitle('Restart Shell Session'));
    fireEvent.click(screen.getByTitle('Maximize Terminal'));
    fireEvent.click(screen.getByText('send terminal data'));
    fireEvent.click(screen.getByText('resize terminal'));
    fireEvent.click(screen.getByTitle('Close Console'));
    expect(state.terminal.restart).toHaveBeenCalledTimes(1);
    expect(state.terminal.writeData).toHaveBeenCalledWith('pwd\n');
    expect(state.terminal.resizeSession).toHaveBeenCalledWith(100, 30);
    expect(state.terminal.setOpen).toHaveBeenCalledWith(false);

    state.terminal = { ...state.terminal, isOpen: false };
    rerender(<TerminalPanel />);
    expect(screen.queryByText(/Terminal Body/i)).toBeNull();

    render(<CommandPalette currentNodes={[]} onOpenNode={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/spotlight search/i), { target: { value: 'home' } });
    fireEvent.mouseEnter(screen.getByText('file.ts'));
    fireEvent.click(screen.getByText('Open Home'));
    fireEvent.click(screen.getByRole('presentation'));
    expect(state.commandPalette.setSearchQuery).toHaveBeenCalledWith('home');
    expect(state.commandPalette.selectIndex).toHaveBeenCalledWith(1);
    expect(state.commandPalette.selectItem).toHaveBeenCalledWith(state.commandPalette.filteredItems[0]);
    expect(state.commandPalette.close).toHaveBeenCalledTimes(1);
  });
});
