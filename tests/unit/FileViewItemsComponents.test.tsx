import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { FileColumnView } from '../../src/renderer/src/components/files/viewers/FileColumnView';
import { GridCell } from '../../src/renderer/src/components/files/viewers/GridCell';
import { ColumnFileItem } from '../../src/renderer/src/components/files/viewers/items/ColumnFileItem';
import { GridFileItem } from '../../src/renderer/src/components/files/viewers/items/GridFileItem';
import { ListFileItem } from '../../src/renderer/src/components/files/viewers/items/ListFileItem';
import { useAppStore } from '../../src/renderer/src/store';
import type { FileSystemNode } from '../../src/shared/types/fileSystem';

const hookMock = vi.hoisted(() => ({
  useFileItem: vi.fn(),
  useFileColumnView: vi.fn(),
  useFileThumbnail: vi.fn(() => ({ thumbnailUrl: null, isLoading: false })),
}));

vi.mock('@renderer/hooks', () => ({
  useFileItem: hookMock.useFileItem,
  useFileColumnView: hookMock.useFileColumnView,
  useFileThumbnail: hookMock.useFileThumbnail,
}));

const fileNode: FileSystemNode = {
  path: '/repo/file.ts',
  name: 'file.ts',
  kind: 'file',
  sizeInBytes: 2048,
  modifiedAt: Date.now(),
  createdAt: Date.now() - 1000,
  isHidden: false,
  extension: 'ts',
};

const dirNode: FileSystemNode = {
  ...fileNode,
  path: '/repo/src',
  name: 'src',
  kind: 'directory',
  sizeInBytes: 0,
  extension: '',
};

function resetFileItemMock(overrides: Partial<ReturnType<typeof baseFileItemState>> = {}) {
  hookMock.useFileItem.mockReturnValue({ ...baseFileItemState(), ...overrides });
}

function baseFileItemState() {
  return {
    selected: false,
    isRenaming: false,
    dragProps: { draggable: true },
    mouseProps: { onClick: vi.fn(), onDoubleClick: vi.fn(), onContextMenu: vi.fn() },
    renameInputProps: {
      value: 'renamed.ts',
      onChange: vi.fn(),
      onBlur: vi.fn(),
      onKeyDown: vi.fn(),
    },
  };
}

const callbacks = {
  onOpen: vi.fn(),
  onSelectionChange: vi.fn(),
  onContextMenu: vi.fn(),
  onStartRename: vi.fn(),
  onRenameValueChange: vi.fn(),
  onCommitRename: vi.fn(),
  onCancelRename: vi.fn(),
  onMove: vi.fn(),
  onExternalDrag: vi.fn(),
};

const itemData = {
  nodes: [fileNode, dirNode],
  selectedPaths: new Set<string>(),
  density: 'comfortable' as const,
  renamingPath: null,
  renamingValue: '',
  renamingError: null,
  dropDestinationPath: null,
  gitStatusMap: { [fileNode.path]: 'modified' as const },
  columnCount: 2,
  iconSize: 36,
  ...callbacks,
};

describe('file view item components', () => {
  it('renders grid, list, and column items with annotations and git state', () => {
    resetFileItemMock({ selected: true });
    useAppStore.setState({
      annotations: {
        [fileNode.path]: {
          path: fileNode.path,
          notes: '',
          updatedAt: 1,
          tags: [{ id: 'tag', label: 'Work', color: '#22c55e' }],
        },
      },
    });

    const { rerender } = render(<GridFileItem node={fileNode} data={itemData} style={{ width: 100, height: 100 }} />);
    expect(screen.getByText('file.ts')).toBeDefined();
    expect(screen.getByTitle('Work')).toBeDefined();

    rerender(<ListFileItem node={fileNode} data={itemData} style={{ height: 34 }} />);
    expect(screen.getByText('M')).toBeDefined();
    expect(screen.getByText('Work')).toBeDefined();

    rerender(
      <ColumnFileItem
        node={dirNode}
        nodes={[fileNode, dirNode]}
        selectedPaths={new Set([dirNode.path])}
        renamingPath={null}
        renamingValue=""
        renamingError={null}
        {...callbacks}
      />,
    );
    expect(screen.getByText('src')).toBeDefined();
  });

  it('renders rename inputs with validation titles', () => {
    resetFileItemMock({ isRenaming: true });

    const { rerender } = render(<GridFileItem node={fileNode} data={{ ...itemData, renamingError: 'Bad name' }} style={{ width: 100, height: 100 }} />);
    expect(screen.getByDisplayValue('renamed.ts')).toHaveProperty('title', 'Bad name');

    rerender(<ListFileItem node={fileNode} data={{ ...itemData, renamingError: 'Bad name' }} style={{ height: 34 }} />);
    expect(screen.getByDisplayValue('renamed.ts')).toHaveProperty('title', 'Bad name');
  });

  it('renders grid cells and ignores empty cells', () => {
    resetFileItemMock();
    const { container } = render(<GridCell columnIndex={0} rowIndex={0} style={{}} data={itemData} />);
    expect(screen.getByText('file.ts')).toBeDefined();

    const empty = render(<GridCell columnIndex={3} rowIndex={9} style={{}} data={itemData} />);
    expect(empty.container.firstChild).toBeNull();
    expect(container.firstChild).toBeTruthy();
  });

  it('renders column view and preview column from hook state', () => {
    resetFileItemMock();
    useAppStore.setState({
      annotations: {
        [fileNode.path]: {
          path: fileNode.path,
          notes: '',
          updatedAt: 1,
          tags: [{ id: 'tag', label: 'PreviewTag', color: '#3b82f6' }],
        },
      },
    });
    hookMock.useFileColumnView.mockReturnValue({
      columns: [{ path: '/repo', nodes: [dirNode, fileNode] }],
      selectedNodeInLastCol: fileNode,
      isFileSelectedInLastCol: true,
    });

    render(
      <FileColumnView
        nodes={[dirNode, fileNode]}
        selectedPaths={new Set([fileNode.path])}
        density="comfortable"
        renamingPath={null}
        renamingValue=""
        renamingError={null}
        dropDestinationPath={null}
        {...callbacks}
      />,
    );

    expect(screen.getAllByText('file.ts').length).toBeGreaterThan(0);
    expect(screen.getAllByText('PreviewTag').length).toBeGreaterThan(1);
  });
});
