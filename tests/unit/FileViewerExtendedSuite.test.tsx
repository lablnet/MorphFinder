import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { viewerModeForExtension } from '../../src/shared/types/fileViewer';
import { FileViewer } from '../../src/renderer/src/components/fileviewer';
import { ArchiveViewer } from '../../src/renderer/src/components/fileviewer/viewers/ArchiveViewer';
import { HtmlViewer } from '../../src/renderer/src/components/fileviewer/viewers/HtmlViewer';
import { OfficeViewer } from '../../src/renderer/src/components/fileviewer/viewers/OfficeViewer';
import { PdfViewer } from '../../src/renderer/src/components/fileviewer/viewers/PdfViewer';
import type { FileSystemNode } from '../../src/shared/types/fileSystem';

const ipcMock = vi.hoisted(() => ({
  invoke: vi.fn(async (channel: string, _payload?: unknown) => {
    if (channel === 'fs:readFile') {
      return {
        content: 'col1,col2,col3\nval1,val2,val3',
        encoding: 'utf-8',
        truncated: false,
        totalBytes: 100,
      };
    }
    if (channel === 'archive:extract') {
      return { extractedDir: '/repo/extracted' };
    }
    if (channel === 'archive:list') {
      return { entries: [{ name: 'file1.txt', isDirectory: false }, { name: 'folder1', isDirectory: true }] };
    }
    return {};
  }),
}));

vi.mock('@renderer/services/ipc', () => ({
  ipc: ipcMock,
}));

const baseNode: FileSystemNode = {
  path: '/repo/test.zip',
  name: 'test.zip',
  kind: 'file',
  sizeInBytes: 1024,
  modifiedAt: Date.now(),
  createdAt: Date.now(),
  isHidden: false,
  extension: 'zip',
};

const baseProps = {
  filePath: baseNode.path,
  node: baseNode,
  onClose: vi.fn(),
  onOpenWithSystem: vi.fn(),
};

describe('FileViewer extended extension modes & viewers', () => {
  it('maps extensions correctly to FileViewerMode', () => {
    expect(viewerModeForExtension('zip')).toBe('archive');
    expect(viewerModeForExtension('tar')).toBe('archive');
    expect(viewerModeForExtension('gz')).toBe('archive');
    expect(viewerModeForExtension('html')).toBe('html');
    expect(viewerModeForExtension('htm')).toBe('html');
    expect(viewerModeForExtension('webmanifest')).toBe('code');
    expect(viewerModeForExtension('manifest')).toBe('code');
    expect(viewerModeForExtension('pdf')).toBe('pdf');
    expect(viewerModeForExtension('xlsx')).toBe('office');
  });

  it('renders ArchiveViewer and handles extraction', async () => {
    const onOpenWithSystem = vi.fn();
    render(<ArchiveViewer {...baseProps} node={{ ...baseNode, name: 'archive.tar.gz', extension: 'tar' }} onOpenWithSystem={onOpenWithSystem} />);

    expect(await screen.findByText('archive.tar.gz')).toBeTruthy();
    expect(screen.getAllByText(/Archive/i).length).toBeGreaterThan(0);

    const extractBtn = screen.getByRole('button', { name: /extract here/i });
    fireEvent.click(extractBtn);
    expect(ipcMock.invoke).toHaveBeenCalledWith('archive:extract', { archivePath: '/repo/test.zip' });
  });

  it('renders HtmlViewer and toggles between preview and source code', async () => {
    const onOpenWithSystem = vi.fn();
    render(<HtmlViewer {...baseProps} node={{ ...baseNode, name: 'index.html', extension: 'html', path: '/repo/index.html' }} filePath="/repo/index.html" onOpenWithSystem={onOpenWithSystem} />);

    expect(screen.getByTitle('index.html')).toBeTruthy();
    const sourceBtn = screen.getByRole('button', { name: /source code/i });
    fireEvent.click(sourceBtn);

    expect(await screen.findByText(/col1,col2,col3/i)).toBeTruthy();
  });

  it('renders OfficeViewer with spreadsheet table rows', async () => {
    render(<OfficeViewer {...baseProps} node={{ ...baseNode, name: 'data.csv', extension: 'csv', path: '/repo/data.csv' }} filePath="/repo/data.csv" />);

    expect(await screen.findByText('data.csv')).toBeTruthy();
    expect(await screen.findByText('val1')).toBeTruthy();
    expect(screen.getByText('val2')).toBeTruthy();
  });

  it('renders PdfViewer with metadata preview card and Open with System App button', () => {
    const onOpenWithSystem = vi.fn();
    render(<PdfViewer {...baseProps} node={{ ...baseNode, name: 'document.pdf', extension: 'pdf' }} onOpenWithSystem={onOpenWithSystem} />);

    expect(screen.getAllByText('document.pdf')[0]).toBeTruthy();
    const openBtn = screen.getAllByRole('button', { name: /open with system app/i })[0];
    expect(openBtn).toBeTruthy();
    fireEvent.click(openBtn);
    expect(onOpenWithSystem).toHaveBeenCalled();
  });

  it('routes FileViewer correctly for archive and html files', () => {
    const { rerender } = render(<FileViewer node={{ ...baseNode, name: 'page.html', extension: 'html' }} onClose={vi.fn()} />);
    expect(screen.getByTitle('page.html')).toBeTruthy();

    rerender(<FileViewer node={{ ...baseNode, name: 'bundle.tar.gz', extension: 'tar' }} onClose={vi.fn()} />);
    expect(screen.getAllByText(/bundle.tar.gz/i).length).toBeGreaterThan(0);
  });
});
