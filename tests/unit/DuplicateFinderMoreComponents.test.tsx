import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DuplicateEmptyState } from '../../src/renderer/src/components/duplicates/components/DuplicateEmptyState';
import { DuplicateGroups } from '../../src/renderer/src/components/duplicates/components/DuplicateGroups';
import { DuplicateLoadingState } from '../../src/renderer/src/components/duplicates/components/DuplicateLoadingState';
import { DuplicateScopePicker } from '../../src/renderer/src/components/duplicates/components/DuplicateScopePicker';
import type { DuplicateGroup } from '../../src/shared/types/duplicates';

vi.mock('@renderer/hooks', () => ({
  useFileThumbnail: vi.fn(() => ({ thumbnailUrl: null, isLoading: false })),
}));

const group: DuplicateGroup = {
  id: 'group-1',
  hash: 'abc',
  sizeInBytes: 1024,
  files: [
    { path: '/a/new.txt', name: 'new.txt', sizeInBytes: 1024, modifiedAt: Date.now(), hash: 'abc' },
    { path: '/a/old.txt', name: 'old.txt', sizeInBytes: 1024, modifiedAt: Date.now() - 1000, hash: 'abc' },
  ],
};

describe('duplicate finder additional components', () => {
  it('renders empty and loading states', () => {
    const { rerender } = render(<DuplicateEmptyState />);
    expect(screen.getByText('No exact duplicate groups found.')).toBeDefined();

    rerender(<DuplicateLoadingState progress={{ phase: 'hashing', currentPath: '/tmp/a', groupsFound: 1 }} />);
    expect(screen.getByText('Hashing duplicate candidates...')).toBeDefined();

    rerender(<DuplicateLoadingState progress={{ phase: 'scanning', currentPath: '/tmp/a', groupsFound: 0 }} />);
    expect(screen.getByText('Scanning duplicate candidates...')).toBeDefined();
  });

  it('changes scan scope and chooses folders', () => {
    const onScopeChange = vi.fn();
    const onChooseFolder = vi.fn();
    render(
      <DuplicateScopePicker
        scanScope="workspaces"
        customFolder="/custom"
        disabled={false}
        onScopeChange={onScopeChange}
        onChooseFolder={onChooseFolder}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /home/i }));
    fireEvent.click(screen.getByRole('button', { name: /choose folder/i }));
    expect(onScopeChange).toHaveBeenCalled();
    expect(onChooseFolder).toHaveBeenCalledTimes(1);
  });

  it('renders duplicate groups and toggles file selection', () => {
    const togglePath = vi.fn();
    render(<DuplicateGroups groups={[group]} selectedPaths={new Set(['/a/old.txt'])} togglePath={togglePath} />);

    expect(screen.getByText('2 copies')).toBeDefined();
    expect(screen.getByText('Newest')).toBeDefined();
    fireEvent.click(screen.getByTitle('Select duplicate'));
    fireEvent.click(screen.getByTitle('Selected for trash'));

    expect(togglePath).toHaveBeenCalledWith('/a/new.txt');
    expect(togglePath).toHaveBeenCalledWith('/a/old.txt');
  });
});
