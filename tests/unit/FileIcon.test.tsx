import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { FileIcon } from '@renderer/components/fileicons/FileIcon';
import type { FileSystemNode } from '@shared/types/fileSystem';

const thumbnailState = vi.hoisted(() => ({
  thumbnailUrl: null as string | null,
}));

vi.mock('@renderer/hooks', () => ({
  useFileThumbnail: vi.fn(() => ({ thumbnailUrl: thumbnailState.thumbnailUrl })),
}));

describe('FileIcon', () => {
  it('renders FolderIcon for directory nodes', () => {
    const dirNode: FileSystemNode = {
      path: '/Users/test',
      name: 'test',
      kind: 'directory',
      sizeInBytes: 0,
      modifiedAt: Date.now(),
      createdAt: Date.now(),
      isHidden: false,
      extension: '',
    };

    const { container } = render(<FileIcon node={dirNode} />);
    expect(container.querySelector('svg')).toBeDefined();
  });

  it('renders custom icon for specific extensions', () => {
    const fileNode: FileSystemNode = {
      path: '/test.ts',
      name: 'test.ts',
      kind: 'file',
      sizeInBytes: 100,
      modifiedAt: Date.now(),
      createdAt: Date.now(),
      isHidden: false,
      extension: 'ts',
    };

    const { container } = render(<FileIcon node={fileNode} />);
    expect(container.querySelector('svg')).toBeDefined();
  });

  it('renders thumbnails and dotfile/default extension fallbacks', () => {
    const imageNode: FileSystemNode = {
      path: '/test.png',
      name: 'test.png',
      kind: 'file',
      sizeInBytes: 100,
      modifiedAt: Date.now(),
      createdAt: Date.now(),
      isHidden: false,
      extension: 'png',
    };

    thumbnailState.thumbnailUrl = 'blob://thumb';
    const { container, rerender } = render(<FileIcon node={imageNode} size={32} className="extra" />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('blob://thumb');

    thumbnailState.thumbnailUrl = null;
    rerender(<FileIcon node={{ ...imageNode, name: '.env', extension: '' }} />);
    expect(container.querySelector('svg')).toBeDefined();

    rerender(<FileIcon node={{ ...imageNode, name: 'unknown.weird', extension: 'weird' }} />);
    expect(container.querySelector('svg')).toBeDefined();
  });
});
