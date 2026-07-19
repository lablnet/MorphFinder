import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DetailsPanel } from '../../src/renderer/src/components/files/DetailsPanel';
import { FileGrid } from '../../src/renderer/src/components/files/viewers/FileGrid';
import { FileListTable } from '../../src/renderer/src/components/files/viewers/FileListTable';
import type { FileSystemNode } from '../../src/shared/types/fileSystem';

const hookState = vi.hoisted(() => ({
  size: { width: 320, height: 180 },
  marquee: {
    marqueeRect: null as null | { left: number; top: number; right: number; bottom: number },
    suppressNextClick: false,
    setSuppressNextClick: vi.fn(),
    marqueeHandlers: { onMouseDown: vi.fn() },
  },
  details: {
    tags: [{ id: 'blue', label: 'Blue', color: '#2563eb' }],
    setTags: vi.fn(),
    notes: 'initial note',
    setNotes: vi.fn(),
    copied: false,
    handleCopyPath: vi.fn(),
    hasChanges: true,
    isSaving: false,
    isLoading: false,
    error: null as string | null,
    save: vi.fn(),
    updatedText: 'just now',
  },
}));

vi.mock('react-window', () => ({
  FixedSizeGrid: ({ columnCount, rowCount, children, itemData }: any) => (
    <div data-testid="virtual-grid">
      {Array.from({ length: rowCount }).flatMap((_, rowIndex) =>
        Array.from({ length: columnCount }).map((__, columnIndex) =>
          React.createElement(children, { columnIndex, rowIndex, style: {}, data: itemData, key: `${rowIndex}-${columnIndex}` }),
        ),
      )}
    </div>
  ),
  FixedSizeList: ({ itemCount, children, itemData }: any) => (
    <div data-testid="virtual-list">
      {Array.from({ length: itemCount }).map((_, index) =>
        React.createElement(children, { index, style: {}, data: itemData, key: index }),
      )}
    </div>
  ),
}));

vi.mock('@renderer/hooks', () => ({
  useElementSize: vi.fn(() => [vi.fn(), hookState.size]),
  useMarquee: vi.fn(() => hookState.marquee),
  useDetailsPanel: vi.fn(() => hookState.details),
}));

vi.mock('../../src/renderer/src/components/files/viewers/GridCell', () => ({
  GridCell: ({ data, rowIndex, columnIndex }: any) => {
    const node = data.nodes[rowIndex * data.columnCount + columnIndex];
    return node ? <button onClick={() => data.onOpen(node)}>{node.name}</button> : <span data-testid="empty-cell" />;
  },
}));

vi.mock('../../src/renderer/src/components/files/viewers/ListRow', () => ({
  ListRow: ({ data, index }: any) => {
    const node = data.nodes[index];
    return <button onClick={() => data.onOpen(node)}>{node.name}</button>;
  },
}));

vi.mock('../../src/renderer/src/components/fileicons/FileIcon', () => ({
  FileIcon: ({ node }: any) => <span data-testid="file-icon">{node.kind}</span>,
}));

vi.mock('../../src/renderer/src/components/directoryannotator/components/TagEditor', () => ({
  TagEditor: ({ onChange }: any) => <button onClick={() => onChange([{ id: 'green', label: 'Green', color: '#16a34a' }])}>Edit tags</button>,
}));

vi.mock('../../src/renderer/src/components/directoryannotator/components/NotesEditor', () => ({
  NotesEditor: ({ value, onChange }: any) => <textarea aria-label="notes" value={value} onChange={(event) => onChange(event.currentTarget.value)} />,
}));

const nodes: FileSystemNode[] = [
  { name: 'Beta.txt', path: '/tmp/Beta.txt', kind: 'file', sizeInBytes: 200, modifiedAt: 30, createdAt: 10 },
  { name: 'Alpha', path: '/tmp/Alpha', kind: 'directory', sizeInBytes: 0, modifiedAt: 20, createdAt: 5 },
  { name: 'Gamma.md', path: '/tmp/Gamma.md', kind: 'file', sizeInBytes: 100, modifiedAt: 10, createdAt: 1 },
];

const baseProps = {
  nodes,
  selectedPaths: new Set<string>(['/tmp/Beta.txt']),
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
  dropDestinationPath: '/drop-here',
  onMove: vi.fn(),
  onExternalDrag: vi.fn(),
};

function dragTransfer(paths: string[]) {
  return {
    getData: (type: string) => (type === 'application/x-morphfinder-paths' ? JSON.stringify(paths) : ''),
  } as DataTransfer;
}

describe('file surfaces coverage targets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hookState.size = { width: 320, height: 180 };
    hookState.marquee.marqueeRect = null;
    hookState.marquee.suppressNextClick = false;
    hookState.details.copied = false;
    hookState.details.error = null;
    hookState.details.isLoading = false;
    hookState.details.isSaving = false;
    hookState.details.hasChanges = true;
  });

  it('renders DetailsPanel metadata, edits annotations, copies paths, saves, and handles alternate states', () => {
    const onClose = vi.fn();
    const { rerender } = render(<DetailsPanel node={nodes[0]} onClose={onClose} />);

    expect(screen.getByText('Beta.txt')).toBeDefined();
    expect(screen.getByText('/tmp/Beta.txt')).toBeDefined();
    fireEvent.click(screen.getByTitle('Copy Path'));
    fireEvent.click(screen.getByRole('button', { name: /edit tags/i }));
    fireEvent.change(screen.getByLabelText('notes'), { target: { value: 'new note' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    fireEvent.click(screen.getByTitle('Close details panel'));

    expect(hookState.details.handleCopyPath).toHaveBeenCalled();
    expect(hookState.details.setTags).toHaveBeenCalledWith([{ id: 'green', label: 'Green', color: '#16a34a' }]);
    expect(hookState.details.setNotes).toHaveBeenCalledWith('new note');
    expect(hookState.details.save).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();

    hookState.details.copied = true;
    hookState.details.error = 'Could not load';
    hookState.details.isLoading = true;
    hookState.details.isSaving = true;
    rerender(<DetailsPanel node={nodes[1]} onClose={onClose} />);
    expect(screen.getByText('Could not load')).toBeDefined();
    expect(screen.getByText('Loading...')).toBeDefined();
    expect(screen.getByRole('button', { name: /saving/i })).toHaveProperty('disabled', true);

    const empty = render(<DetailsPanel node={null} onClose={onClose} />);
    expect(empty.container.firstChild).toBeNull();
  });

  it('covers FileGrid selection clearing, suppression, context menu, cell open, drop, and marquee overlay', () => {
    hookState.marquee.marqueeRect = { left: 5, top: 6, right: 30, bottom: 40 };
    const { container, rerender } = render(<FileGrid {...baseProps} />);
    const root = container.firstElementChild as HTMLElement;

    fireEvent.click(screen.getByRole('button', { name: 'Beta.txt' }));
    expect(baseProps.onOpen).toHaveBeenCalledWith(nodes[0]);

    fireEvent.click(root);
    expect(baseProps.onSelectionChange).toHaveBeenCalledWith([]);

    hookState.marquee.suppressNextClick = true;
    rerender(<FileGrid {...baseProps} />);
    fireEvent.click(container.firstElementChild as HTMLElement);
    expect(hookState.marquee.setSuppressNextClick).toHaveBeenCalledWith(false);

    fireEvent.contextMenu(container.firstElementChild as HTMLElement);
    expect(baseProps.onContextMenu).toHaveBeenCalledWith(null, expect.any(Object));

    fireEvent.dragOver(container.firstElementChild as HTMLElement);
    fireEvent.drop(container.firstElementChild as HTMLElement, { dataTransfer: dragTransfer(['/from']) });
    expect(baseProps.onMove).toHaveBeenCalledWith(['/from'], '/drop-here');
    expect(screen.getByTestId('virtual-grid')).toBeDefined();
  });

  it('covers FileListTable sorting, row open, empty-area selection, context menu, and drop behavior', () => {
    const { container } = render(<FileListTable {...baseProps} />);
    expect(screen.getByTestId('virtual-list')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /alpha/i }));
    expect(baseProps.onOpen).toHaveBeenCalledWith(nodes[1]);

    fireEvent.click(screen.getByRole('button', { name: /size/i }));
    fireEvent.click(screen.getByRole('button', { name: /size/i }));
    fireEvent.click(screen.getByRole('button', { name: /modified/i }));
    expect(screen.getByRole('button', { name: /modified/i }).textContent).toContain('▲');

    const root = container.firstElementChild as HTMLElement;
    fireEvent.click(root);
    fireEvent.contextMenu(root);
    fireEvent.drop(root, { dataTransfer: dragTransfer(['/picked']) });
    expect(baseProps.onSelectionChange).toHaveBeenCalledWith([]);
    expect(baseProps.onContextMenu).toHaveBeenCalledWith(null, expect.any(Object));
    expect(baseProps.onMove).toHaveBeenCalledWith(['/picked'], '/drop-here');
  });
});
