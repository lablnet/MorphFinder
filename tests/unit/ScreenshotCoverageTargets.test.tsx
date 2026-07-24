import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TerminalContainer } from '../../src/renderer/src/components/terminal/components/TerminalContainer';
import { useCodeViewer } from '../../src/renderer/src/hooks/files/viewers/useCodeViewer';
import { useMarkdownViewer } from '../../src/renderer/src/hooks/files/viewers/useMarkdownViewer';
import { useTextViewer } from '../../src/renderer/src/hooks/files/viewers/useTextViewer';
import { DolphinSidebar } from '../../src/renderer/src/layouts/dolphin/DolphinSidebar';
import { ExplorerSidebar } from '../../src/renderer/src/layouts/explorer/ExplorerSidebar';
import { FinderSidebar } from '../../src/renderer/src/layouts/finder/FinderSidebar';
import { ShellLayout } from '../../src/renderer/src/layouts/ShellLayout';
import { useAppStore } from '../../src/renderer/src/store';

const ipcState = vi.hoisted(() => ({
  invoke: vi.fn(),
}));

const xtermState = vi.hoisted(() => ({
  lastTerminal: null as any,
  dataHandler: null as ((data: string) => void) | null,
  fit: vi.fn(),
  disposeData: vi.fn(),
}));

const monacoState = vi.hoisted(() => ({
  create: vi.fn(() => ({ dispose: vi.fn() })),
  setTheme: vi.fn(),
}));

vi.mock('@renderer/services/ipc', () => ({
  ipc: {
    invoke: (...args: any[]) => ipcState.invoke(...args),
  },
}));

vi.mock('xterm', () => ({
  Terminal: vi.fn().mockImplementation((options) => {
    const terminal = {
      cols: 80,
      rows: 24,
      options,
      loadAddon: vi.fn(),
      open: vi.fn(),
      write: vi.fn((_data: string, cb?: () => void) => cb?.()),
      focus: vi.fn(),
      onData: vi.fn((handler: (data: string) => void) => {
        xtermState.dataHandler = handler;
        return { dispose: xtermState.disposeData };
      }),
      clear: vi.fn(),
      scrollToBottom: vi.fn(),
      dispose: vi.fn(),
    };
    xtermState.lastTerminal = terminal;
    return terminal;
  }),
}));

vi.mock('xterm-addon-fit', () => ({
  FitAddon: vi.fn().mockImplementation(() => ({ fit: xtermState.fit })),
}));

vi.mock('monaco-editor', () => ({
  editor: {
    create: (...args: any[]) => monacoState.create(...args),
    setTheme: (...args: any[]) => monacoState.setTheme(...args),
  },
}));

vi.mock('@renderer/hooks', async () => {
  const actual = await vi.importActual<any>('../../src/renderer/src/hooks');
  return {
    ...actual,
    useLayoutShell: vi.fn(() => ({
      shell: {
        id: 'test-shell',
        regions: {
          WindowChrome: ({ children }: { children: React.ReactNode }) => <div data-testid="window-chrome">{children}</div>,
          Sidebar: ({ wellKnownDirs, activePath, onNavigate }: any) => (
            <button onClick={() => onNavigate('/side')}>Sidebar {activePath} {wellKnownDirs?.home}</button>
          ),
          StatusBar: ({ children }: { children: React.ReactNode }) => <div data-testid="status-bar">{children}</div>,
        },
      },
    })),
    useWellKnownDirs: vi.fn(),
  };
});

Object.defineProperty(window, 'ResizeObserver', {
  value: class {
    observe = vi.fn();
    disconnect = vi.fn();
  },
  configurable: true,
});

Object.defineProperty(window, 'matchMedia', {
  value: vi.fn(() => ({ matches: false })),
  configurable: true,
});

const wellKnownDirs = {
  home: '/home',
  desktop: '/home/Desktop',
  documents: '/home/Documents',
  downloads: '/home/Downloads',
};

function resetTargets() {
  vi.clearAllMocks();
  xtermState.lastTerminal = null;
  xtermState.dataHandler = null;
  ipcState.invoke.mockResolvedValue({ content: 'hello', encoding: 'utf-8', truncated: false });
  useAppStore.setState({
    themeMode: 'light',
    activeShell: 'finder',
    wellKnownDirs,
    pinnedFolders: ['/pinned/project'],
    activeTabId: 'tab-1',
    tabs: [{ id: 'tab-1', path: '/home', title: 'home', history: ['/home'], historyIndex: 0, viewMode: 'icons' }],
  } as any);
  Object.defineProperty(window, 'morph', {
    value: {
      invoke: vi.fn(async () => [
        { id: 'cloud', name: 'Cloud Drive', path: '/cloud', iconType: 'cloud', iconDataUrl: 'data:image/png;base64,a', isRemovable: false, isInternal: false },
      ]),
      on: vi.fn(() => vi.fn()),
    },
    configurable: true,
  });
}

describe('coverage targets from report screenshot', () => {
  beforeEach(resetTargets);

  it('covers TerminalContainer data entry, output streaming, theme updates, and cleanup', () => {
    const onData = vi.fn();
    const onResize = vi.fn();
    const { rerender, unmount } = render(<TerminalContainer output="" onData={onData} onResize={onResize} />);

    expect(onResize).toHaveBeenCalledWith(80, 24);
    act(() => xtermState.dataHandler?.('p'));
    act(() => xtermState.dataHandler?.('w'));
    act(() => xtermState.dataHandler?.('d'));
    act(() => xtermState.dataHandler?.('\u007F'));
    act(() => xtermState.dataHandler?.('\r'));
    expect(onData).toHaveBeenCalledWith('pw\n');

    rerender(<TerminalContainer output="line one\nline two" onData={onData} onResize={onResize} />);
    expect(xtermState.lastTerminal.write.mock.calls.some((call: any[]) => String(call[0]).includes('line one'))).toBe(true);

    rerender(<TerminalContainer output="short" onData={onData} onResize={onResize} />);
    expect(xtermState.lastTerminal.clear).toHaveBeenCalledTimes(1);

    useAppStore.setState({ themeMode: 'dark' });
    rerender(<TerminalContainer output="shorter" onData={onData} onResize={onResize} />);
    expect(xtermState.lastTerminal.options.theme.background).toBe('#1e1e2e');

    unmount();
    expect(xtermState.disposeData).toHaveBeenCalled();
    expect(xtermState.lastTerminal.dispose).toHaveBeenCalled();
  });

  it('covers text, markdown, and code viewer hooks for success, binary, and failure states', async () => {
    const text = renderHook(() => useTextViewer({ filePath: '/file.txt' }));
    await waitFor(() => expect(text.result.current.content).toBe('hello'));
    expect(text.result.current.truncated).toBe(false);

    ipcState.invoke.mockResolvedValueOnce({ content: 'deadbeef', encoding: 'base64', truncated: false });
    const binaryText = renderHook(() => useTextViewer({ filePath: '/bin.dat' }));
    await waitFor(() => expect(binaryText.result.current.error).toMatch(/binary/i));

    ipcState.invoke.mockRejectedValueOnce(new Error('read failed'));
    const failedMarkdown = renderHook(() => useMarkdownViewer({ filePath: '/bad.md' }));
    await waitFor(() => expect(failedMarkdown.result.current.error).toBe('read failed'));

    ipcState.invoke.mockResolvedValueOnce({ content: '# Title', encoding: 'utf-8', truncated: false });
    const markdown = renderHook(() => useMarkdownViewer({ filePath: '/ok.md' }));
    await waitFor(() => expect(markdown.result.current.content).toBe('# Title'));

    const code = renderHook(() => useCodeViewer({ filePath: '/code.ts', extension: 'ts' }));
    act(() => {
      code.result.current.containerRef.current = document.createElement('div');
    });
    await waitFor(() => expect(monacoState.create).toHaveBeenCalled());
    expect(monacoState.create.mock.calls.at(-1)?.[1]).toMatchObject({ language: 'typescript', readOnly: true });
    code.unmount();

    ipcState.invoke.mockResolvedValueOnce({ content: 'AA==', encoding: 'base64', truncated: false });
    const binaryCode = renderHook(() => useCodeViewer({ filePath: '/bin', extension: 'unknown' }));
    act(() => {
      binaryCode.result.current.containerRef.current = document.createElement('div');
    });
    await waitFor(() => expect(binaryCode.result.current.error).toMatch(/binary/i));
  });

  it('covers finder, explorer, dolphin sidebars and shell layout navigation', async () => {
    const onNavigate = vi.fn();
    render(<FinderSidebar wellKnownDirs={wellKnownDirs} activePath="/home" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole('button', { name: /downloads/i }));
    fireEvent.click(screen.getByRole('button', { name: /project/i }));
    fireEvent.click(screen.getByTitle('Unpin Folder'));
    fireEvent.contextMenu(screen.getByRole('button', { name: /home/i }));
    await waitFor(() => expect(screen.getByText('Cloud Drive')).toBeDefined());
    expect(onNavigate).toHaveBeenCalledWith('/home/Downloads');
    expect(useAppStore.getState().pinnedFolders).not.toContain('/pinned/project');

    const { unmount } = render(<ExplorerSidebar wellKnownDirs={wellKnownDirs} activePath="/home/Desktop" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole('button', { name: /this pc/i }));
    expect(onNavigate).toHaveBeenCalledWith('morph://this-pc');
    unmount();

    render(<DolphinSidebar wellKnownDirs={wellKnownDirs} activePath="/" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole('button', { name: /macintosh hd/i }));
    expect(onNavigate).toHaveBeenCalledWith('/');

    const openTab = vi.fn();
    const navigateActiveTab = vi.fn();
    useAppStore.setState({ openTab, navigateActiveTab, activeTabId: null } as any);
    render(
      <ShellLayout>
        <ShellLayout.TabArea>Tabs</ShellLayout.TabArea>
        <ShellLayout.PathArea>Path</ShellLayout.PathArea>
        <ShellLayout.Content>Content</ShellLayout.Content>
        <ShellLayout.StatusArea>Status</ShellLayout.StatusArea>
      </ShellLayout>
    );
    expect(screen.getByTestId('morph-shell').dataset.shell).toBe('test-shell');
    fireEvent.click(screen.getByText(/Sidebar/i));
    expect(openTab).toHaveBeenCalledWith('/side');

    useAppStore.setState({ activeTabId: 'tab-1' } as any);
    render(<ShellLayout><ShellLayout.Content>Only content</ShellLayout.Content></ShellLayout>);
    fireEvent.click(screen.getAllByText(/Sidebar/i).at(-1)!);
    expect(navigateActiveTab).toHaveBeenCalledWith('/side');
  });
});
