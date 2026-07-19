import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CacheTable } from '@renderer/components/cachecleaner/components/CacheTable';
import { SpaceDashboard } from '@renderer/components/cachecleaner/components/SpaceDashboard';
import { UnsupportedPlatform } from '@renderer/components/cachecleaner/components/UnsupportedPlatform';

describe('CacheCleaner Sub-Components', () => {
  it('renders CacheTable loading spinner during scanning', () => {
    render(
      <CacheTable
        scanning={true}
        sortedTargets={[]}
        selectedIds={new Set()}
        errors={{}}
        sortBy="name"
        sortOrder="asc"
        handleToggleSelect={vi.fn()}
        handleToggleSelectAll={vi.fn()}
        toggleSort={vi.fn()}
      />
    );
    expect(screen.getByText('Scanning folders & calculating sizes...')).toBeDefined();
  });

  it('renders SpaceDashboard metrics card', () => {
    render(<SpaceDashboard scanning={false} totalScannedSize={1024 * 1024 * 500} totalSelectedSize={1024 * 1024 * 100} selectedCount={2} totalCount={5} />);
    expect(screen.getByText('Total Scanned Caches')).toBeDefined();
  });

  it('renders UnsupportedPlatform warning', () => {
    render(<UnsupportedPlatform />);
    expect(screen.getByText(/Windows & Linux Support Coming Soon/)).toBeDefined();
  });
});
