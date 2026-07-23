import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DuplicateFinderHeader } from '@renderer/components/duplicates/components/DuplicateFinderHeader';
import { DuplicateProgress } from '@renderer/components/duplicates/components/DuplicateProgress';
import { DuplicateStats } from '@renderer/components/duplicates/components/DuplicateStats';

describe('DuplicateFinder Sub-Components', () => {
  it('renders DuplicateFinderHeader', () => {
    render(
      <DuplicateFinderHeader
        scanning={false}
        cleaning={false}
        groupsCount={2}
        selectedCount={1}
        selectedBytes={1024}
        onScan={vi.fn()}
        onStop={vi.fn()}
        onKeepNewest={vi.fn()}
        onTrashSelected={vi.fn()}
      />
    );
    expect(screen.getByText('Duplicate Finder')).toBeDefined();
  });

  it('renders DuplicateProgress', () => {
    render(<DuplicateProgress progress={{ phase: 'hashing', currentPath: '/file.txt', groupsFound: 1 }} />);
    expect(screen.getByText('hashing')).toBeDefined();
  });

  it('renders DuplicateStats', () => {
    render(<DuplicateStats groupsCount={5} selectedCount={2} scanMeta={{ scannedCount: 10, hashedCount: 5, candidateFilesCount: 8, potentialSavingsBytes: 2048 }} />);
    expect(screen.getByText('Groups')).toBeDefined();
  });
});
