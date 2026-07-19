import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { DetailsPanel } from '../../src/renderer/src/components/files/DetailsPanel';
import { ArchiveProgressCard } from '../../src/renderer/src/components/files/ArchiveProgressCard';
import { FileOpProgressCard } from '../../src/renderer/src/components/files/FileOpProgressCard';

vi.mock('../../src/renderer/src/services/ipc', () => ({
  ipc: {
    invoke: vi.fn().mockResolvedValue({}),
    on: vi.fn().mockReturnValue(() => {}),
  },
}));

describe('File Components Extended Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders DetailsPanel with file metadata', () => {
    const node = {
      name: 'report.pdf',
      path: '/tmp/report.pdf',
      kind: 'file' as const,
      size: 1048576,
      isHidden: false,
      isSymlink: false,
      updatedAt: Date.now(),
      extension: 'pdf',
    };

    render(<DetailsPanel node={node} onClose={vi.fn()} />);
    expect(screen.getByText('report.pdf')).toBeDefined();
  });

  it('renders ArchiveProgressCard', () => {
    const item: any = {
      operationId: 'arch-1',
      type: 'compress',
      fileName: 'test.zip',
      percent: 60,
      bytesProcessed: 600,
      totalBytes: 1000,
      done: false,
      error: null,
    };

    render(<ArchiveProgressCard item={item} onCancel={vi.fn()} />);

    expect(screen.getByText('test.zip')).toBeDefined();
    expect(screen.getByText('60%')).toBeDefined();
  });

  it('renders FileOpProgressCard', () => {
    const item: any = {
      operationId: 'op-1',
      kind: 'copy',
      completed: 3,
      total: 5,
      fileName: 'file3.txt',
      currentPath: '/tmp/file3.txt',
      done: false,
      error: null,
    };

    render(<FileOpProgressCard item={item} onCancel={vi.fn()} />);

    expect(screen.getByText(/file3\.txt/i)).toBeDefined();
  });
});
