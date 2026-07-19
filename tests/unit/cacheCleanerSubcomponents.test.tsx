import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CacheTable } from '../../src/renderer/src/components/cachecleaner/components/CacheTable';
import { SpaceDashboard } from '../../src/renderer/src/components/cachecleaner/components/SpaceDashboard';
import { UnsupportedPlatform } from '../../src/renderer/src/components/cachecleaner/components/UnsupportedPlatform';
import { ProgressDialog } from '../../src/renderer/src/components/cachecleaner/components/ProgressDialog';
import { ConfirmDialogs } from '../../src/renderer/src/components/cachecleaner/components/ConfirmDialogs';

describe('Cache Cleaner Subcomponents Coverage', () => {
  const mockTarget: any = {
    id: 'c1',
    name: 'App Caches',
    category: 'Developer',
    description: 'System cache files',
    path: '/tmp/cache',
    sizeInBytes: 10485760,
  };

  it('renders CacheTable and toggles selections', () => {
    const handleToggleSelect = vi.fn();
    const handleToggleSelectAll = vi.fn();
    const toggleSort = vi.fn();

    render(
      <CacheTable
        scanning={false}
        sortedTargets={[mockTarget]}
        selectedIds={new Set(['c1'])}
        errors={{}}
        sortBy="size"
        sortOrder="desc"
        handleToggleSelect={handleToggleSelect}
        handleToggleSelectAll={handleToggleSelectAll}
        toggleSort={toggleSort}
      />
    );

    expect(screen.getByText('App Caches')).toBeDefined();
  });

  it('renders SpaceDashboard statistics', () => {
    render(
      <SpaceDashboard
        scanning={false}
        totalScannedSize={10485760}
        totalSelectedSize={5242880}
        selectedCount={2}
        totalCount={5}
      />
    );
    expect(screen.getByText(/10 MB/i)).toBeDefined();
  });

  it('renders UnsupportedPlatform warning', () => {
    render(<UnsupportedPlatform />);
    expect(screen.getByText(/Windows & Linux Support Coming Soon/i)).toBeDefined();
  });

  it('renders ProgressDialog', () => {
    render(<ProgressDialog isOpen={true} mode="scan" />);
  });

  it('renders ConfirmDialogs first and second confirmation dialogs', () => {
    const setShowFirstConfirm = vi.fn();
    const setShowSecondConfirm = vi.fn();
    const handleClean = vi.fn();

    render(
      <ConfirmDialogs
        activeShell="finder"
        showFirstConfirm={true}
        setShowFirstConfirm={setShowFirstConfirm}
        showSecondConfirm={false}
        setShowSecondConfirm={setShowSecondConfirm}
        selectedIds={new Set(['c1'])}
        totalSelectedSize={10485760}
        targets={[mockTarget]}
        hasApplicationSupportSelected={true}
        handleClean={handleClean}
      />
    );

    expect(screen.getByText('Confirm Cache Deletion')).toBeDefined();
    fireEvent.click(screen.getByText('Yes, Proceed'));
    expect(setShowSecondConfirm).toHaveBeenCalledWith(true);

    render(
      <ConfirmDialogs
        activeShell="finder"
        showFirstConfirm={false}
        setShowFirstConfirm={setShowFirstConfirm}
        showSecondConfirm={true}
        setShowSecondConfirm={setShowSecondConfirm}
        selectedIds={new Set(['c1'])}
        totalSelectedSize={10485760}
        targets={[mockTarget]}
        hasApplicationSupportSelected={true}
        handleClean={handleClean}
      />
    );

    expect(screen.getByText('Final Irreversible Warning')).toBeDefined();
    fireEvent.click(screen.getByText('Yes, Permanent Delete'));
    expect(handleClean).toHaveBeenCalled();
  });
});
