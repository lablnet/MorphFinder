import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../src/renderer/src/App';
import { useAppStore } from '../../src/renderer/src/store';
import {
  CACHE_CLEANER_PATH,
  DEV_PANEL_PATH,
  DUPLICATE_FINDER_PATH,
  FILE_TIMELINE_PATH,
  SPACE_ANALYZER_PATH,
} from '../../src/shared/constants';
import type { FileSystemNode } from '../../src/shared/types/fileSystem';

const state = vi.hoisted(() => ({
  controller: {} as any,
  gitRadar: {} as any,
  projectDetector: { hasProject: true, projectType: 'node', projectName: 'app' },
  onboarding: { isOpen: false, openOnboarding: vi.fn(), closeOnboarding: vi.fn() },
  ipcInvoke: vi.fn(async () => undefined),
}));

vi.mock('@renderer/services/ipc', () => ({
  ipc: {
    invoke: (...args: any[]) => state.ipcInvoke(...args),
    on: vi.fn(() => vi.fn()),
  },
}));

vi.mock('@renderer/hooks', () => ({
  useKeyboardShortcuts: vi.fn(),
  useFileSystemController: vi.fn(() => state.controller),
  useGitRadar: vi.fn(() => state.gitRadar),
  useProjectDetector: vi.fn(() => state.projectDetector),
  useOnboarding: vi.fn(() => state.onboarding),
  useDetailsPanel: vi.fn(() => ({
    tags: [],
    setTags: vi.fn(),
    notes: '',
    setNotes: vi.fn(),
    copied: false,
    handleCopyPath: vi.fn(),
    hasChanges: false,
    isSaving: false,
    isLoading: false,
    error: null,
    save: vi.fn(),
    updatedText: 'now',
  })),
  useArchiveProgress: vi.fn(() => ({ archives: [], cancelArchive: vi.fn() })),
  useFileOperationProgress: vi.fn(() => ({ fileOperations: [], cancelFileOp: vi.fn() })),
}));

vi.mock('@renderer/layouts/ShellLayout', () => {
  function ShellLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="shell-layout">{children}</div>;
  }
  ShellLayout.TabArea = ({ children }: { children: React.ReactNode }) => <div data-testid="tab-area">{children}</div>;
  ShellLayout.PathArea = ({ children }: { children: React.ReactNode }) => <div data-testid="path-area">{children}</div>;
  ShellLayout.Content = ({ children }: { children: React.ReactNode }) => <main>{children}</main>;
  ShellLayout.StatusArea = ({ children }: { children: React.ReactNode }) => <footer>{children}</footer>;
  return { ShellLayout };
});

vi.mock('@renderer/components/navigation/TabStrip', () => ({ TabStrip: () => <div>Tab Strip</div> }));
vi.mock('@renderer/components/navigation/FileToolbar', () => ({
  FileToolbar: ({ onCreateFolder, onTrashSelected, onRefresh, onViewModeChange, gitRadarNode }: any) => (
    <div>
      <span>File Toolbar</span>
      <button onClick={onCreateFolder}>toolbar create</button>
      <button onClick={onTrashSelected}>toolbar trash</button>
      <button onClick={onRefresh}>toolbar refresh</button>
      <button onClick={() => onViewModeChange('list')}>toolbar list</button>
      {gitRadarNode}
    </div>
  ),
}));
vi.mock('@renderer/components/files/FileView', () => ({
  FileView: ({ nodes, onOpen, onSelectionChange, onContextMenu, onStartRename, onMove, onExternalDrag }: any) => (
    <div>
      <span>File View {nodes.map((node: FileSystemNode) => node.name).join(',')}</span>
      <button onClick={() => onOpen(nodes[0])}>open file</button>
      <button onClick={() => onSelectionChange(['/repo/file.ts'])}>select file</button>
      <button onClick={(event) => onContextMenu(event, nodes[0])}>context file</button>
      <button onClick={() => onStartRename(nodes[0])}>rename file</button>
      <button onClick={() => onMove(['/repo/file.ts'], '/repo/dest')}>move file</button>
      <button onClick={() => onExternalDrag(['/repo/file.ts'])}>drag file</button>
    </div>
  ),
}));
vi.mock('@renderer/components/fileviewer', () => ({ FileViewer: ({ onClose }: any) => <button onClick={onClose}>File Viewer</button> }));
vi.mock('@renderer/components/files/FileContextMenu', () => ({
  FileContextMenu: ({ onAction, onClose }: any) => (
    <div>
      <button onClick={() => onAction('open')}>Context Menu</button>
      <button onClick={onClose}>Close Context</button>
    </div>
  ),
}));
vi.mock('@renderer/components/ui/NamePromptDialog', () => ({
  NamePromptDialog: ({ onChange, onConfirm, onCancel }: any) => (
    <div>
      <input aria-label="name prompt" onChange={(event) => onChange(event.currentTarget.value)} />
      <button onClick={() => onConfirm('new')}>Confirm Name</button>
      <button onClick={onCancel}>Cancel Name</button>
    </div>
  ),
}));
vi.mock('@renderer/components/cachecleaner/CacheCleaner', () => ({ CacheCleaner: () => <div>Cache Cleaner Route</div> }));
vi.mock('@renderer/components/spaceanalyzer', () => ({ SpaceAnalyzer: () => <div>Space Analyzer Route</div> }));
vi.mock('@renderer/components/devpanel/DevPanel', () => ({ DevPanel: () => <div>Dev Panel Route</div> }));
vi.mock('@renderer/components/duplicates/DuplicateFinder', () => ({ DuplicateFinder: () => <div>Duplicate Finder Route</div> }));
vi.mock('@renderer/components/filetimeline/FileTimeline', () => ({ FileTimeline: ({ onOpenPath }: any) => <button onClick={() => onOpenPath('/repo/file.ts')}>File Timeline Route</button> }));
vi.mock('@renderer/components/navigation/CommandPalette', () => ({ CommandPalette: ({ onOpenOnboarding }: any) => <button onClick={onOpenOnboarding}>Command Palette</button> }));
vi.mock('@renderer/components/onboarding/OnboardingModal', () => ({ OnboardingModal: ({ isOpen, onClose }: any) => (isOpen ? <button onClick={onClose}>Onboarding Modal</button> : null) }));
vi.mock('@renderer/components/devpanel/components/DevPanelStatusButton', () => ({ DevPanelStatusButton: ({ onClick }: any) => <button onClick={onClick}>Dev Status</button> }));
vi.mock('@renderer/components/gitradar/GitRadar', () => ({ GitRadar: ({ toggleOpen }: any) => <button onClick={toggleOpen}>Git Radar</button> }));
vi.mock('@renderer/components/gitradar/components/GitDrawer', () => ({ GitDrawer: ({ isOpen, onClose, onRefresh }: any) => (isOpen ? <div><button onClick={onClose}>Git Drawer</button><button onClick={onRefresh}>Refresh Git</button></div> : null) }));
vi.mock('@renderer/components/terminal/TerminalPanel', () => ({ TerminalPanel: () => <div>Terminal Panel</div> }));
vi.mock('@renderer/components/files/DetailsPanel', () => ({ DetailsPanel: ({ onClose }: any) => <button onClick={onClose}>Details Panel</button> }));
vi.mock('@renderer/components/snapshots/WorkspaceSnapshotsModal', () => ({ WorkspaceSnapshotsModal: () => <div>Snapshots Modal</div> }));
vi.mock('@renderer/components/files/OperationProgressContainer', () => ({ OperationProgressContainer: () => <div>Operation Progress</div> }));

const fileNode: FileSystemNode = {
  path: '/repo/file.ts',
  name: 'file.ts',
  kind: 'file',
  sizeInBytes: 10,
  modifiedAt: 1,
  createdAt: 1,
  isHidden: false,
  extension: 'ts',
};

function makeController(overrides: Partial<typeof state.controller> = {}) {
  const controller = {
    tabs: {
      all: [{ id: 'tab-1', path: '/repo', title: 'repo' }],
      activeId: 'tab-1',
      activePath: '/repo',
      activePathLabel: '/repo',
      canGoBack: true,
      canGoForward: false,
      open: vi.fn(),
      activate: vi.fn(),
      close: vi.fn(),
      openHome: vi.fn(),
      reorder: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    },
    fs: {
      nodes: [fileNode],
      error: null,
      errorKind: null,
      isLoading: false,
      navigate: vi.fn(),
      refresh: vi.fn(async () => undefined),
      openNode: vi.fn(),
      fileViewerTarget: null,
      closeFileViewer: vi.fn(),
    },
    selection: { selectedPaths: ['/repo/file.ts'], selectedSet: new Set(['/repo/file.ts']) },
    operations: { trash: vi.fn(async () => undefined) },
    layoutShell: { shell: { id: 'finder' }, setShell: vi.fn() },
    theme: { mode: 'light', setMode: vi.fn() },
    viewMode: 'icons',
    isVirtualLocation: false,
    renameDraft: null,
    namePrompt: null,
    contextMenu: null,
    statusText: '1 item',
    onNamePromptChange: vi.fn(),
    closeNamePrompt: vi.fn(),
    createFolder: vi.fn(async () => undefined),
    openContextMenu: vi.fn(),
    runContextAction: vi.fn(),
    handleSelectionChange: vi.fn(),
    renameNode: vi.fn(async () => undefined),
    commitRename: vi.fn(),
    cancelRename: vi.fn(),
    moveDroppedPaths: vi.fn(async () => undefined),
    setActiveTabViewMode: vi.fn(),
    onRenameValueChange: vi.fn(),
    closeContextMenu: vi.fn(),
    ...overrides,
  };
  state.controller = controller;
  return controller;
}

function resetApp() {
  vi.clearAllMocks();
  makeController();
  state.gitRadar = {
    gitStatus: { isRepo: true, branch: 'main', isDirty: false, ahead: 0, behind: 0, statusMap: {} },
    gitHistory: [],
    isLoading: false,
    error: null,
    isOpen: false,
    toggleOpen: vi.fn(),
    refresh: vi.fn(),
  };
  state.onboarding = { isOpen: false, openOnboarding: vi.fn(), closeOnboarding: vi.fn() };
  useAppStore.setState({
    terminalOpen: false,
    detailsNode: null,
    activeTagFilter: null,
    annotations: {},
  });
  window.history.replaceState({}, '', '/');
}

describe('App', () => {
  beforeEach(resetApp);

  it('renders file view and wires top-level actions and overlays', () => {
    useAppStore.setState({
      terminalOpen: true,
      detailsNode: fileNode,
      annotations: { '/repo/file.ts': { path: '/repo/file.ts', tags: [{ id: 't', label: 'work', color: '#fff' }], notes: '', updatedAt: 1 } },
      activeTagFilter: 'work',
    });
    state.controller.contextMenu = { x: 1, y: 2, node: fileNode };
    state.controller.namePrompt = { title: 'New folder', value: '' };
    state.controller.fs.fileViewerTarget = fileNode;
    state.gitRadar.isOpen = true;
    state.onboarding.isOpen = true;

    render(<App />);

    expect(screen.getByText(/File View file.ts/i)).toBeDefined();
    fireEvent.click(screen.getByText('toolbar create'));
    fireEvent.click(screen.getByText('toolbar trash'));
    fireEvent.click(screen.getByText('toolbar refresh'));
    fireEvent.click(screen.getByText('toolbar list'));
    fireEvent.click(screen.getByText('open file'));
    fireEvent.click(screen.getByText('select file'));
    fireEvent.click(screen.getByText('context file'));
    fireEvent.click(screen.getByText('rename file'));
    fireEvent.click(screen.getByText('move file'));
    fireEvent.click(screen.getByText('drag file'));
    fireEvent.click(screen.getByText('Dev Status'));
    fireEvent.click(screen.getByText('Git Radar'));
    fireEvent.click(screen.getByText('Refresh Git'));
    fireEvent.click(screen.getByText('Command Palette'));
    fireEvent.click(screen.getByText('Onboarding Modal'));
    fireEvent.click(screen.getByText('Context Menu'));
    fireEvent.click(screen.getByText('Close Context'));
    fireEvent.change(screen.getByLabelText('name prompt'), { target: { value: 'folder' } });
    fireEvent.click(screen.getByText('Confirm Name'));
    fireEvent.click(screen.getByText('Cancel Name'));
    fireEvent.click(screen.getByText('File Viewer'));
    fireEvent.click(screen.getByText('Details Panel'));
    fireEvent.click(screen.getByTitle(/toggle console shell/i));

    expect(state.controller.createFolder).toHaveBeenCalledTimes(1);
    expect(state.controller.operations.trash).toHaveBeenCalledWith(['/repo/file.ts']);
    expect(state.controller.setActiveTabViewMode).toHaveBeenCalledWith('list');
    expect(state.controller.fs.openNode).toHaveBeenCalledWith(fileNode);
    expect(state.controller.handleSelectionChange).toHaveBeenCalledWith(['/repo/file.ts']);
    expect(state.controller.renameNode).toHaveBeenCalledWith(fileNode);
    expect(state.controller.moveDroppedPaths).toHaveBeenCalledWith(['/repo/file.ts'], '/repo/dest');
    expect(state.ipcInvoke).toHaveBeenCalledWith('shell:startDrag', { paths: ['/repo/file.ts'] });
    expect(state.controller.fs.navigate).toHaveBeenCalledWith(DEV_PANEL_PATH);
    expect(state.onboarding.openOnboarding).toHaveBeenCalledTimes(1);
    expect(state.onboarding.closeOnboarding).toHaveBeenCalledTimes(1);
  });

  it('renders primary route branches and empty/error states', () => {
    const { rerender } = render(<App />);
    expect(screen.getByText(/File View file.ts/i)).toBeDefined();

    state.controller.tabs = { ...state.controller.tabs, activeId: null };
    rerender(<App />);
    fireEvent.click(screen.getByRole('button', { name: /open home/i }));
    expect(state.controller.tabs.openHome).toHaveBeenCalledTimes(1);

    for (const [path, label] of [
      [CACHE_CLEANER_PATH, 'Cache Cleaner Route'],
      [DEV_PANEL_PATH, 'Dev Panel Route'],
      [DUPLICATE_FINDER_PATH, 'Duplicate Finder Route'],
      [SPACE_ANALYZER_PATH, 'Space Analyzer Route'],
    ] as const) {
      state.controller.tabs = { ...state.controller.tabs, activeId: 'tab-1', activePath: path };
      rerender(<App />);
      expect(screen.getByText(label)).toBeDefined();
    }

    state.controller.tabs = { ...state.controller.tabs, activePath: FILE_TIMELINE_PATH };
    rerender(<App />);
    fireEvent.click(screen.getByText('File Timeline Route'));
    expect(state.ipcInvoke).toHaveBeenCalledWith('shell:showInFolder', { path: '/repo/file.ts' });

    state.controller.tabs = { ...state.controller.tabs, activePath: '/repo' };
    state.controller.fs = { ...state.controller.fs, error: 'no access', errorKind: 'permission' };
    rerender(<App />);
    expect(screen.getByRole('alert').textContent).toContain('Permission denied');
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    fireEvent.click(screen.getByRole('button', { name: /open home/i }));

    state.controller.fs = { ...state.controller.fs, error: null, isLoading: true, nodes: [] };
    rerender(<App />);
    expect(screen.getByText(/collecting files/i)).toBeDefined();

    state.controller.fs = { ...state.controller.fs, isLoading: false, nodes: [] };
    rerender(<App />);
    expect(screen.getByText('This folder is empty')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /new folder/i }));

    state.controller.fs = { ...state.controller.fs, nodes: [fileNode] };
    useAppStore.setState({ activeTagFilter: 'missing', annotations: {} });
    rerender(<App />);
    expect(screen.getByText('No items match the selected tag filter')).toBeDefined();
  });

  it('opens initial path from the query string once', () => {
    window.history.replaceState({}, '', '/?initialPath=/tmp/project');
    render(<App />);
    expect(state.controller.tabs.open).toHaveBeenCalledWith('/tmp/project');
  });
});
