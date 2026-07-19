import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DolphinSidebar from '../../src/renderer/src/layouts/dolphin/DolphinSidebar';
import ExplorerSidebar from '../../src/renderer/src/layouts/explorer/ExplorerSidebar';
import { ShellLayout } from '../../src/renderer/src/layouts/ShellLayout';
import { useAppStore } from '../../src/renderer/src/store';

describe('Layout Shells Extended Coverage', () => {
  const wellKnownDirs = {
    home: '/Users/test',
    desktop: '/Users/test/Desktop',
    documents: '/Users/test/Documents',
    downloads: '/Users/test/Downloads',
    pictures: '/Users/test/Pictures',
    music: '/Users/test/Music',
    videos: '/Users/test/Videos',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders DolphinSidebar and handles navigation & unpin', () => {
    useAppStore.setState({ pinnedFolders: ['/Users/test/Projects'] });
    const onNavigate = vi.fn();

    render(
      <DolphinSidebar
        wellKnownDirs={wellKnownDirs}
        activePath="/Users/test"
        onNavigate={onNavigate}
      />
    );

    expect(screen.getByText('Places')).toBeDefined();
    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Projects')).toBeDefined();

    fireEvent.click(screen.getByText('Home'));
    expect(onNavigate).toHaveBeenCalledWith('/Users/test');

    const unpinBtn = screen.getByTitle('Unpin Folder');
    fireEvent.click(unpinBtn);
    expect(useAppStore.getState().pinnedFolders).not.toContain('/Users/test/Projects');
  });

  it('renders ExplorerSidebar and handles navigation', () => {
    useAppStore.setState({ pinnedFolders: ['/Users/test/Pinned'] });
    const onNavigate = vi.fn();

    render(
      <ExplorerSidebar
        wellKnownDirs={wellKnownDirs}
        activePath="/Users/test/Desktop"
        onNavigate={onNavigate}
      />
    );

    expect(screen.getByText('Desktop')).toBeDefined();
    fireEvent.click(screen.getByText('Desktop'));
    expect(onNavigate).toHaveBeenCalledWith('/Users/test/Desktop');
  });

  it('renders ShellLayout with slotted children', () => {
    render(
      <ShellLayout>
        <ShellLayout.Content>
          <div data-testid="page-content">Child Page Content</div>
        </ShellLayout.Content>
      </ShellLayout>
    );

    expect(screen.getByTestId('page-content')).toBeDefined();
  });
});
