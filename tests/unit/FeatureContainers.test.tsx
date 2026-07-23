import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DirectoryAnnotator } from '../../src/renderer/src/components/directoryannotator/DirectoryAnnotator';
import { DuplicateFinder } from '../../src/renderer/src/components/duplicates/DuplicateFinder';
import { FileTimeline } from '../../src/renderer/src/components/filetimeline/FileTimeline';
import { FileView } from '../../src/renderer/src/components/files/FileView';
import { OperationProgressContainer } from '../../src/renderer/src/components/files/OperationProgressContainer';
import { SpaceAnalyzer } from '../../src/renderer/src/components/spaceanalyzer/SpaceAnalyzer';
import { useAppStore } from '../../src/renderer/src/store';
import type { FileSystemNode } from '../../src/shared/types/fileSystem';
import type { SpaceAnalyzerNode } from '../../src/shared/types/spaceAnalyzer';

const state = vi.hoisted(() => ({
  timeline: {
    rootPath: '/repo',
    days: 7,
    result: null,
    groups: [] as Array<{ key: string; label: string; items: any[] }>,
    isLoading: false,
    error: null as string | null,
    setDays: vi.fn(),
    scan: vi.fn(async () => undefined),
    chooseFolder: vi.fn(async () => undefined),
  },
  duplicate: {
    groups: [] as any[],
    selectedPaths: new Set<string>(),
    selectedBytes: 0,
    scanning: false,
    cleaning: false,
    scanScope: 'workspaces',
    customFolder: null as string | null,
    message: null as string | null,
    scanMeta: null as any,
    progress: null as any,
    setScanScope: vi.fn(),
    scan: vi.fn(async () => undefined),
    stopScan: vi.fn(async () => undefined),
    chooseFolder: vi.fn(async () => undefined),
    keepNewest: vi.fn(),
    togglePath: vi.fn(),
    trashSelected: vi.fn(async () => undefined),
  },
  annotations: {
    annotation: { path: '/repo/file.ts', tags: [], notes: '', updatedAt: 0 },
    isLoading: false,
    isSaving: false,
    error: null as string | null,
    save: vi.fn(async () => undefined),
  },
  space: {} as any,
  archiveProgress: { archives: [] as any[], cancelArchive: vi.fn() },
  fileOperationProgress: { fileOperations: [] as any[], cancelFileOp: vi.fn() },
}));

vi.mock('@renderer/hooks/files/useFileTimeline', () => ({
  useFileTimeline: vi.fn(() => state.timeline),
}));

vi.mock('@renderer/hooks/duplicates/useDuplicateFinder', () => ({
  useDuplicateFinder: vi.fn(() => state.duplicate),
}));

vi.mock('@renderer/hooks', () => ({
  useDirectoryAnnotations: vi.fn(() => state.annotations),
  useSpaceAnalyzer: vi.fn(() => state.space),
  useArchiveProgress: vi.fn(() => state.archiveProgress),
  useFileOperationProgress: vi.fn(() => state.fileOperationProgress),
  useElementSize: vi.fn(() => [vi.fn(), { width: 600, height: 400 }]),
  useFileThumbnail: vi.fn(() => ({ thumbnailUrl: null, isLoading: false })),
  useFileItem: vi.fn(() => ({
    selected: false,
    isRenaming: false,
    dragProps: {},
    mouseProps: {},
    renameInputProps: { value: '', onChange: vi.fn(), onBlur: vi.fn(), onKeyDown: vi.fn() },
  })),
  useFileColumnView: vi.fn(() => ({ columns: [], selectedNodeInLastCol: null, isFileSelectedInLastCol: false })),
}));

vi.mock('../../src/renderer/src/components/files/viewers/FileGrid', () => ({
  FileGrid: () => <div>Grid View</div>,
}));

vi.mock('../../src/renderer/src/components/files/viewers/FileListTable', () => ({
  FileListTable: () => <div>List View</div>,
}));

vi.mock('../../src/renderer/src/components/files/viewers/FileColumnView', () => ({
  FileColumnView: () => <div>Column View</div>,
}));

const fileNode: FileSystemNode = {
  path: '/repo/file.ts',
  name: 'file.ts',
  kind: 'file',
  sizeInBytes: 1024,
  modifiedAt: Date.now(),
  createdAt: Date.now(),
  isHidden: false,
  extension: 'ts',
};

const spaceNode: SpaceAnalyzerNode = {
  id: '/repo',
  name: 'repo',
  path: '/repo',
  size: 4096,
  isDirectory: true,
  children: [
    { id: '/repo/src', name: 'src', path: '/repo/src', size: 2048, isDirectory: true, children: [], fileCount: 2 },
    { id: '/repo/file.ts', name: 'file.ts', path: '/repo/file.ts', size: 2048, isDirectory: false, fileCount: 1 },
  ],
  fileCount: 3,
};

const fileViewProps = {
  nodes: [fileNode],
  selectedPaths: new Set<string>(),
  density: 'comfortable' as const,
  onOpen: vi.fn(),
  onSelectionChange: vi.fn(),
  onContextMenu: vi.fn(),
  onStartRename: vi.fn(),
  renamingPath: null,
  renamingValue: '',
  renamingError: null,
  onRenameValueChange: vi.fn(),
  onCommitRename: vi.fn(),
  onCancelRename: vi.fn(),
  dropDestinationPath: null,
  onMove: vi.fn(),
  onExternalDrag: vi.fn(),
};

function resetSpace(overrides: Partial<typeof state.space> = {}) {
  state.space = {
    currentPathInput: '/repo',
    setCurrentPathInput: vi.fn(),
    viewedPath: '/repo',
    isScanning: false,
    scanResult: null,
    currentSubTree: null,
    viewMode: 'treemap',
    setViewMode: vi.fn(),
    hoveredPath: null,
    scanError: null,
    setHoveredPath: vi.fn(),
    triggerScan: vi.fn(async () => undefined),
    cancelScan: vi.fn(async () => undefined),
    drillDown: vi.fn(),
    browseFolder: vi.fn(async () => undefined),
    progress: { fileCount: 0, size: 0, scannedPath: '' },
    diskTotal: 0,
    diskFree: 0,
    selectedPath: null,
    setSelectedPath: vi.fn(),
    history: [],
    navigateUp: vi.fn(),
    ...overrides,
  };
}

describe('feature containers', () => {
  it('renders file timeline and wires controls/list item open', () => {
    const onOpenPath = vi.fn();
    state.timeline.groups = [{ key: 'today', label: 'Today', items: [{ path: '/repo/file.ts', name: 'file.ts', extension: 'ts', sizeInBytes: 100, createdAt: Date.now(), modifiedAt: Date.now(), eventAt: Date.now(), eventKind: 'modified' }] }];
    render(<FileTimeline initialRootPath="/repo" onOpenPath={onOpenPath} />);

    fireEvent.click(screen.getByRole('button', { name: /folder/i }));
    expect(screen.getByText('Choose Timeline Folder')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /scan/i }));
    fireEvent.click(screen.getByText('file.ts'));
    expect(state.timeline.scan).toHaveBeenCalledTimes(1);
    expect(onOpenPath).toHaveBeenCalledWith('/repo/file.ts');
  });

  it('renders duplicate finder with groups and dispatches actions', () => {
    state.duplicate.groups = [{ id: 'g', hash: 'h', sizeInBytes: 100, files: [{ path: '/old', name: 'old.txt', sizeInBytes: 100, modifiedAt: Date.now(), hash: 'h' }] }];
    state.duplicate.selectedPaths = new Set(['/old']);
    state.duplicate.message = 'Ready';
    state.duplicate.scanMeta = { scannedCount: 10, hashedCount: 2, truncated: false };
    render(<DuplicateFinder />);

    expect(screen.getByText('Ready')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /scan/i }));
    fireEvent.click(screen.getByRole('button', { name: /trash/i }));
    fireEvent.click(screen.getByTitle('Selected for trash'));
    expect(state.duplicate.scan).toHaveBeenCalledTimes(1);
    expect(state.duplicate.trashSelected).toHaveBeenCalledTimes(1);
    expect(state.duplicate.togglePath).toHaveBeenCalledWith('/old');
  });

  it('renders directory annotator, edits, saves, closes, and hides without a node', () => {
    const onClose = vi.fn();
    const { container, rerender } = render(<DirectoryAnnotator node={null} onClose={onClose} />);
    expect(container.firstChild).toBeNull();

    rerender(<DirectoryAnnotator node={fileNode} onClose={onClose} />);
    expect(screen.getByText('file.ts')).toBeDefined();
    fireEvent.change(screen.getByPlaceholderText('Write markdown notes for this file or folder...'), { target: { value: 'notes' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    fireEvent.click(screen.getByTitle('Close notes and tags'));
    expect(state.annotations.save).toHaveBeenCalledWith({ tags: [], notes: 'notes' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('routes file views by mode', () => {
    const { rerender } = render(<FileView {...fileViewProps} viewMode="icons" />);
    expect(screen.getByText('Grid View')).toBeDefined();
    rerender(<FileView {...fileViewProps} viewMode="list" />);
    expect(screen.getByText('List View')).toBeDefined();
    rerender(<FileView {...fileViewProps} viewMode="columns" />);
    expect(screen.getByText('Column View')).toBeDefined();
  });

  it('renders space analyzer empty, error, loading, and scanned states', () => {
    useAppStore.setState({ wellKnownDirs: { home: '/home', desktop: '/desktop', documents: '/docs', downloads: '/downloads' } });
    resetSpace();
    const { rerender } = render(<SpaceAnalyzer />);
    expect(screen.getByText('No scan active')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /scan default path/i }));
    expect(state.space.triggerScan).toHaveBeenCalledTimes(1);

    resetSpace({ scanError: 'No permission' });
    rerender(<SpaceAnalyzer />);
    expect(screen.getByText('Directory Scan Failed')).toBeDefined();

    resetSpace({ isScanning: true, progress: { fileCount: 4, size: 2048, scannedPath: '/repo' } });
    rerender(<SpaceAnalyzer />);
    expect(screen.getByText(/Scanning/)).toBeDefined();

    resetSpace({ scanResult: spaceNode, currentSubTree: spaceNode, selectedPath: '/repo/file.ts', diskTotal: 10000, diskFree: 5000 });
    rerender(<SpaceAnalyzer />);
    expect(screen.getAllByText('file.ts').length).toBeGreaterThan(1);
  });

  it('renders operation progress cards and returns null when empty', () => {
    state.archiveProgress = { archives: [], cancelArchive: vi.fn() };
    state.fileOperationProgress = { fileOperations: [], cancelFileOp: vi.fn() };
    const { container, rerender } = render(<OperationProgressContainer />);
    expect(container.firstChild).toBeNull();

    state.archiveProgress = { archives: [{ operationId: 'a', kind: 'compress', currentPath: '/a', completed: 1, total: 2, done: false }], cancelArchive: vi.fn() };
    state.fileOperationProgress = { fileOperations: [{ operationId: 'f', kind: 'copy', currentPath: '/f', completed: 1, total: 3, done: false }], cancelFileOp: vi.fn() };
    rerender(<OperationProgressContainer />);
    expect(screen.getByText('Extracting Archive')).toBeDefined();
    expect(screen.getByText('File Operation')).toBeDefined();
  });
});
