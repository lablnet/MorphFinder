import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FolderPickerDialog } from '../../src/renderer/src/components/folderpicker/FolderPickerDialog';
import { parentFolderPath } from '../../src/renderer/src/hooks/files/useFolderPicker';
import { useAppStore } from '../../src/renderer/src/store';
import type { DirectoryListing } from '../../src/shared/types/fileSystem';

const ipcState = vi.hoisted(() => ({
  invoke: vi.fn(),
}));

vi.mock('@renderer/services/ipc', () => ({
  ipc: {
    invoke: (...args: any[]) => ipcState.invoke(...args),
    on: vi.fn(() => vi.fn()),
  },
}));

const listings: Record<string, DirectoryListing> = {
  '/home': {
    path: '/home',
    hasPartialResults: false,
    nodes: [
      { path: '/home/projects', name: 'projects', kind: 'directory', sizeInBytes: 0, modifiedAt: 200, createdAt: 100, isHidden: false, extension: '' },
      { path: '/home/readme.txt', name: 'readme.txt', kind: 'file', sizeInBytes: 1024, modifiedAt: 300, createdAt: 250, isHidden: false, extension: 'txt' },
    ],
  },
  '/home/projects': {
    path: '/home/projects',
    hasPartialResults: false,
    nodes: [
      { path: '/home/projects/app', name: 'app', kind: 'directory', sizeInBytes: 0, modifiedAt: 500, createdAt: 400, isHidden: false, extension: '' },
    ],
  },
  '/typed': {
    path: '/typed',
    hasPartialResults: false,
    nodes: [
      { path: '/typed/live', name: 'live', kind: 'directory', sizeInBytes: 0, modifiedAt: 700, createdAt: 600, isHidden: false, extension: '' },
    ],
  },
};

function resetStore(): void {
  useAppStore.setState({
    activeShell: 'finder',
    showHiddenFiles: false,
    wellKnownDirs: { home: '/home', desktop: '/desktop', documents: '/documents', downloads: '/downloads' },
  } as any);
}

function renderPicker(props: Partial<React.ComponentProps<typeof FolderPickerDialog>> = {}) {
  return render(
    <FolderPickerDialog
      initialPath="/home"
      title="Choose Test Folder"
      onChoose={vi.fn()}
      onClose={vi.fn()}
      {...props}
    />,
  );
}

describe('FolderPickerDialog', () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    resetStore();
    ipcState.invoke.mockImplementation(async (channel, payload) => {
      if (channel !== 'fs:readDirectory') return null;
      const listing = listings[payload.path];
      if (!listing) throw new Error(`No listing for ${payload.path}`);
      return listing;
    });
  });

  it('renders folders and files, opens folders, and chooses the current folder', async () => {
    const onChoose = vi.fn();
    renderPicker({ onChoose });

    expect(await screen.findByText('projects')).toBeDefined();
    expect(screen.getByText('readme.txt')).toBeDefined();
    expect(screen.getByText('1 folders, 1 files')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'projects' }));
    expect(await screen.findByText('app')).toBeDefined();
    expect(screen.getByText('/home/projects')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /choose this folder/i }));
    expect(onChoose).toHaveBeenCalledWith('/home/projects');
  });

  it('shows list mode with metadata and keeps files disabled', async () => {
    renderPicker();
    expect(await screen.findByText('projects')).toBeDefined();

    fireEvent.click(screen.getByTitle('List view'));
    expect(screen.getByText('Size / Kind')).toBeDefined();
    expect(screen.getByText('1.0 KB')).toBeDefined();
    expect((screen.getByRole('button', { name: /readme\.txt/i }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('loads typed paths after a short debounce', async () => {
    renderPicker();
    expect(await screen.findByText('projects')).toBeDefined();

    const pathInput = screen.getByDisplayValue('/home');
    fireEvent.focus(pathInput);
    fireEvent.change(pathInput, { target: { value: '/typed' } });

    expect(screen.queryByText('live')).toBeNull();
    expect(await screen.findByText('live', undefined, { timeout: 1200 })).toBeDefined();
    expect(ipcState.invoke).toHaveBeenCalledWith('fs:readDirectory', { path: '/typed', includeHidden: false });
  });

  it('uses Go and Places navigation', async () => {
    renderPicker();
    expect(await screen.findByText('projects')).toBeDefined();

    fireEvent.change(screen.getByDisplayValue('/home'), { target: { value: '/home/projects' } });
    fireEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(await screen.findByText('app')).toBeDefined();

    fireEvent.click(within(screen.getByRole('complementary')).getByText('Home'));
    await waitFor(() => expect(screen.getByText('/home')).toBeDefined());
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    renderPicker({ onClose });
    expect(await screen.findByText('projects')).toBeDefined();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('parentFolderPath', () => {
  it('handles posix and windows roots', () => {
    expect(parentFolderPath('/home/projects')).toBe('/home');
    expect(parentFolderPath('/')).toBe('/');
    expect(parentFolderPath('C:\\Users\\Ada')).toBe('C:\\Users');
    expect(parentFolderPath('C:\\')).toBe('C:\\');
  });
});
