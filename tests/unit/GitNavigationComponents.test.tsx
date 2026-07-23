import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { GitRadar } from '../../src/renderer/src/components/gitradar/GitRadar';
import { CommitList } from '../../src/renderer/src/components/gitradar/components/CommitList';
import { GitDrawer } from '../../src/renderer/src/components/gitradar/components/GitDrawer';
import { FileToolbar } from '../../src/renderer/src/components/navigation/FileToolbar';
import { PathBreadcrumb } from '../../src/renderer/src/components/navigation/PathBreadcrumb';
import { SidebarContextMenu } from '../../src/renderer/src/components/navigation/SidebarContextMenu';
import { TabStrip } from '../../src/renderer/src/components/navigation/TabStrip';
import { DolphinChrome } from '../../src/renderer/src/layouts/dolphin/DolphinChrome';
import { ExplorerChrome } from '../../src/renderer/src/layouts/explorer/ExplorerChrome';
import { FinderChrome } from '../../src/renderer/src/layouts/finder/FinderChrome';
import { useAppStore } from '../../src/renderer/src/store';
import type { GitStatus } from '../../src/shared/types/git';

const ipcMock = vi.hoisted(() => ({
  invoke: vi.fn(async () => ({})),
}));

vi.mock('@renderer/services/ipc', () => ({
  ipc: ipcMock,
}));

const gitStatus: GitStatus = {
  isInstalled: true,
  isRepo: true,
  branch: 'main',
  repoRoot: '/repo',
  statusMap: {
    '/repo/a.ts': 'modified',
    '/repo/b.ts': 'staged',
    '/repo/c.ts': 'untracked',
    '/repo/d.ts': 'added',
  },
};

describe('git, navigation, and shell components', () => {
  it('renders git radar for repositories and hides virtual paths', () => {
    const toggleOpen = vi.fn();
    const { container, rerender } = render(<GitRadar activePath="morph://this-pc" activeShell="finder" gitStatus={gitStatus} isOpen={false} toggleOpen={toggleOpen} />);
    expect(container.firstChild).toBeNull();

    rerender(<GitRadar activePath="/repo" activeShell="finder" gitStatus={gitStatus} isOpen={false} toggleOpen={toggleOpen} />);
    fireEvent.click(screen.getByLabelText('Git Radar'));
    expect(toggleOpen).toHaveBeenCalledTimes(1);
  });

  it('renders git drawer states and commit history', () => {
    const onClose = vi.fn();
    const onRefresh = vi.fn();
    const { rerender } = render(<GitDrawer isOpen={false} onClose={onClose} gitStatus={gitStatus} gitHistory={[]} isLoading={false} onRefresh={onRefresh} error={null} />);
    expect(screen.queryByText('Git Radar')).toBeNull();

    rerender(<GitDrawer isOpen onClose={onClose} gitStatus={null} gitHistory={[]} isLoading onRefresh={onRefresh} error={null} />);
    expect(screen.getByText('Loading Git status...')).toBeDefined();

    rerender(<GitDrawer isOpen onClose={onClose} gitStatus={{ ...gitStatus, isInstalled: false }} gitHistory={[]} isLoading={false} onRefresh={onRefresh} error={null} />);
    expect(screen.getByText('Git Not Installed')).toBeDefined();

    rerender(<GitDrawer isOpen onClose={onClose} gitStatus={{ ...gitStatus, isRepo: false }} gitHistory={[]} isLoading={false} onRefresh={onRefresh} error={null} />);
    expect(screen.getByText('Not a Git Repo')).toBeDefined();

    rerender(
      <GitDrawer
        isOpen
        onClose={onClose}
        gitStatus={gitStatus}
        gitHistory={[{ hash: 'abc123', author: 'Alex', date: '2026-07-23', message: 'Add tests' }]}
        isLoading={false}
        onRefresh={onRefresh}
        error={null}
      />,
    );
    expect(screen.getByText('main')).toBeDefined();
    expect(screen.getByText('Add tests')).toBeDefined();
    fireEvent.click(screen.getAllByRole('button')[0]!);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('renders commit list empty and populated states', () => {
    const { rerender } = render(<CommitList commits={[]} />);
    expect(screen.getByText('No commits found in this branch')).toBeDefined();

    rerender(<CommitList commits={[{ hash: 'def456', author: 'Sam', date: 'Today', message: 'Ship it' }]} />);
    expect(screen.getByText('Ship it')).toBeDefined();
    expect(screen.getByText('Sam')).toBeDefined();
  });

  it('activates, closes, creates, and reorders tabs', () => {
    const onActivate = vi.fn();
    const onClose = vi.fn();
    const onNew = vi.fn();
    const onReorder = vi.fn();
    render(
      <TabStrip
        tabs={[{ id: 'a', title: 'A', path: '/a' }, { id: 'b', title: 'B', path: '/b' }]}
        activeTabId="a"
        onActivate={onActivate}
        onClose={onClose}
        onNew={onNew}
        onReorder={onReorder}
      />,
    );

    fireEvent.click(screen.getByText('B'));
    fireEvent.click(screen.getByLabelText('Close A'));
    fireEvent.click(screen.getByLabelText('New tab'));
    expect(onActivate).toHaveBeenCalledWith('b');
    expect(onClose).toHaveBeenCalledWith('a');
    expect(onNew).toHaveBeenCalledTimes(1);
  });

  it('navigates through filesystem and virtual breadcrumbs', () => {
    const onNavigate = vi.fn();
    const { rerender } = render(<PathBreadcrumb path="/Users/alex/project" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByTitle('alex'));
    expect(onNavigate).toHaveBeenCalledWith('/Users/alex');

    rerender(<PathBreadcrumb path="morph://space-analyzer" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('Space Analyzer'));
    expect(onNavigate).toHaveBeenCalledWith('morph://space-analyzer');
  });

  it('renders file toolbar actions and tag filters', () => {
    useAppStore.setState({
      annotations: {
        '/repo': { path: '/repo', notes: '', updatedAt: 1, tags: [{ id: 'work', label: 'Work', color: '#fff' }] },
      },
      activeTagFilter: null,
    });
    const navigate = vi.fn();
    const onCreateFolder = vi.fn();
    const onTrashSelected = vi.fn();
    const onViewModeChange = vi.fn();
    const onRefresh = vi.fn();
    render(
      <FileToolbar
        shellId="finder"
        setShell={vi.fn()}
        activePath="/repo"
        navigate={navigate}
        canGoBack
        canGoForward={false}
        onBack={vi.fn()}
        onForward={vi.fn()}
        themeMode="light"
        onThemeChange={vi.fn()}
        isVirtualLocation={false}
        onCreateFolder={onCreateFolder}
        selectedPathsCount={2}
        onTrashSelected={onTrashSelected}
        viewMode="icons"
        onViewModeChange={onViewModeChange}
        onRefresh={onRefresh}
        gitRadarNode={<span>git-node</span>}
      />,
    );

    fireEvent.click(screen.getByLabelText('New Folder'));
    fireEvent.click(screen.getByLabelText('Move to Trash'));
    fireEvent.click(screen.getByLabelText('List'));
    fireEvent.click(screen.getByLabelText('Refresh'));
    fireEvent.change(screen.getByDisplayValue('All Tags'), { target: { value: 'Work' } });
    expect(onCreateFolder).toHaveBeenCalledTimes(1);
    expect(onTrashSelected).toHaveBeenCalledTimes(1);
    expect(onViewModeChange).toHaveBeenCalledWith('list');
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(screen.getByText('git-node')).toBeDefined();
  });

  it('opens sidebar paths in tabs and windows', () => {
    const openTab = vi.fn();
    useAppStore.setState({ openTab });
    const onClose = vi.fn();
    render(<SidebarContextMenu state={{ x: 10, y: 20, path: '/repo' }} onClose={onClose} />);

    fireEvent.click(screen.getByRole('menuitem', { name: /open in new tab/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /open in new window/i }));
    expect(openTab).toHaveBeenCalledWith('/repo', { activate: true });
    expect(ipcMock.invoke).toHaveBeenCalledWith('shell:newWindow', { path: '/repo' });
  });

  it('renders shell chrome wrappers', () => {
    const { rerender } = render(<FinderChrome>Finder Child</FinderChrome>);
    expect(screen.getByText('Finder Child')).toBeDefined();
    rerender(<ExplorerChrome>Explorer Child</ExplorerChrome>);
    expect(screen.getByText('Explorer Child')).toBeDefined();
    rerender(<DolphinChrome>Dolphin Child</DolphinChrome>);
    expect(screen.getByText('Dolphin Child')).toBeDefined();
  });
});
