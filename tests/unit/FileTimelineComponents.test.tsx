import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { FileTimelineControls } from '../../src/renderer/src/components/filetimeline/components/FileTimelineControls';
import { FileTimelineEmptyState } from '../../src/renderer/src/components/filetimeline/components/FileTimelineEmptyState';
import { FileTimelineHeader } from '../../src/renderer/src/components/filetimeline/components/FileTimelineHeader';
import { FileTimelineItem } from '../../src/renderer/src/components/filetimeline/components/FileTimelineItem';
import { FileTimelineList } from '../../src/renderer/src/components/filetimeline/components/FileTimelineList';
import { FileTimelineStat } from '../../src/renderer/src/components/filetimeline/components/FileTimelineStat';
import { FileTimelineStats } from '../../src/renderer/src/components/filetimeline/components/FileTimelineStats';
import type { FileTimelineItem as TimelineItem } from '../../src/shared/types/fileTimeline';

const item: TimelineItem = {
  path: '/repo/src/index.ts',
  name: 'index.ts',
  extension: '.ts',
  sizeInBytes: 2048,
  createdAt: Date.now() - 10_000,
  modifiedAt: Date.now() - 5_000,
  eventAt: Date.now() - 5_000,
  eventKind: 'modified',
  gitStatus: 'modified',
};

describe('file timeline components', () => {
  it('renders header path and triggers folder/scan actions', () => {
    const onChooseFolder = vi.fn();
    const onScan = vi.fn();
    render(<FileTimelineHeader rootPath="/repo" isLoading={false} onChooseFolder={onChooseFolder} onScan={onScan} />);

    expect(screen.getByText('File Timeline')).toBeTruthy();
    expect(screen.getByText('/repo')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /folder/i }));
    fireEvent.click(screen.getByRole('button', { name: /scan/i }));

    expect(onChooseFolder).toHaveBeenCalledTimes(1);
    expect(onScan).toHaveBeenCalledTimes(1);
  });

  it('renders controls and reports selected day changes', () => {
    const onDaysChange = vi.fn();
    render(<FileTimelineControls days={7} disabled={false} onDaysChange={onDaysChange} />);

    fireEvent.click(screen.getByRole('button', { name: '30d' }));
    expect(onDaysChange).toHaveBeenCalledWith(30);
  });

  it('renders empty and loading states', () => {
    const { rerender } = render(<FileTimelineEmptyState isLoading={false} />);
    expect(screen.getByText('No recent file activity found.')).toBeTruthy();

    rerender(<FileTimelineEmptyState isLoading />);
    expect(screen.getByText('Building timeline...')).toBeTruthy();
  });

  it('renders stats with and without scan results', () => {
    const { rerender } = render(<FileTimelineStats result={null} />);
    expect(screen.getAllByText('--')).toHaveLength(3);

    rerender(
      <FileTimelineStats
        result={{
          rootPath: '/repo',
          items: [item],
          scannedCount: 42,
          isGitRepo: true,
          repoRoot: '/repo',
        }}
      />,
    );
    expect(screen.getByText('Files')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
    expect(screen.getByText('Repo')).toBeTruthy();
  });

  it('renders a timeline item and opens its path', () => {
    const onOpen = vi.fn();
    render(<FileTimelineItem item={item} onOpen={onOpen} />);

    expect(screen.getByText('index.ts')).toBeTruthy();
    expect(screen.getByText('/repo/src/index.ts')).toBeTruthy();
    expect(screen.getAllByText('modified')).toHaveLength(2);

    fireEvent.click(screen.getByRole('button'));
    expect(onOpen).toHaveBeenCalledWith('/repo/src/index.ts');
  });

  it('renders grouped timeline lists', () => {
    const onOpen = vi.fn();
    render(<FileTimelineList groups={[{ key: 'today', label: 'Today', items: [item] }]} onOpen={onOpen} />);

    expect(screen.getByText('Today')).toBeTruthy();
    fireEvent.click(screen.getByRole('button'));
    expect(onOpen).toHaveBeenCalledWith('/repo/src/index.ts');
  });

  it('renders a standalone stat tile', () => {
    render(<FileTimelineStat label="Changed" value="12" />);
    expect(screen.getByText('Changed')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
  });
});
