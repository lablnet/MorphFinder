import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { FileViewer } from '../../src/renderer/src/components/fileviewer';
import { FileViewerToolbar } from '../../src/renderer/src/components/fileviewer/FileViewerToolbar';
import { morphFileUrl } from '../../src/renderer/src/components/fileviewer/types';
import { AudioPlayer } from '../../src/renderer/src/components/fileviewer/viewers/AudioPlayer';
import { CodeViewer } from '../../src/renderer/src/components/fileviewer/viewers/CodeViewer';
import { ImageViewer } from '../../src/renderer/src/components/fileviewer/viewers/ImageViewer';
import { MarkdownViewer } from '../../src/renderer/src/components/fileviewer/viewers/MarkdownViewer';
import { OfficeViewer } from '../../src/renderer/src/components/fileviewer/viewers/OfficeViewer';
import { PdfViewer } from '../../src/renderer/src/components/fileviewer/viewers/PdfViewer';
import { TextViewer } from '../../src/renderer/src/components/fileviewer/viewers/TextViewer';
import { UnknownViewer } from '../../src/renderer/src/components/fileviewer/viewers/UnknownViewer';
import { VideoPlayer } from '../../src/renderer/src/components/fileviewer/viewers/VideoPlayer';
import type { FileSystemNode } from '../../src/shared/types/fileSystem';

const hookState = vi.hoisted(() => ({
  text: { content: 'line one\nline two', error: null as string | null, truncated: false },
  markdown: { content: '# Heading\n\nBody', error: null as string | null },
  code: { containerRef: { current: null }, isLoading: false, error: null as string | null, truncated: false },
  image: {
    zoom: 1,
    rotation: 0,
    dimensions: { w: 640, h: 480 } as { w: number; h: number } | null,
    isPanning: false,
    pan: { x: 0, y: 0 },
    containerRef: { current: null },
    src: 'morph-file://local/image.png',
    handleWheel: vi.fn(),
    handleMouseDown: vi.fn(),
    handleMouseMove: vi.fn(),
    handleMouseUp: vi.fn(),
    handleLoad: vi.fn(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    rotate: vi.fn(),
    fitToView: vi.fn(),
  },
  audio: {
    audioRef: { current: null },
    isPlaying: false,
    isMuted: false,
    currentTime: 61,
    duration: 125,
    progress: 48,
    src: 'morph-file://local/song.mp3',
    togglePlay: vi.fn(),
    toggleMute: vi.fn(),
    handleSeek: vi.fn(),
  },
  video: {
    videoRef: { current: null },
    isPlaying: false,
    isMuted: true,
    currentTime: 5,
    duration: 65,
    progress: 7,
    src: 'morph-file://local/movie.mp4',
    togglePlay: vi.fn(),
    toggleMute: vi.fn(),
    handleSeek: vi.fn(),
    handleFullscreen: vi.fn(),
  },
}));

const ipcMock = vi.hoisted(() => ({
  invoke: vi.fn(async () => ({})),
}));

vi.mock('@renderer/hooks', () => ({
  useTextViewer: vi.fn(() => hookState.text),
  useMarkdownViewer: vi.fn(() => hookState.markdown),
  useCodeViewer: vi.fn(() => hookState.code),
  useImageViewer: vi.fn(() => hookState.image),
  useAudioPlayer: vi.fn(() => hookState.audio),
  useVideoPlayer: vi.fn(() => hookState.video),
  useFileThumbnail: vi.fn(() => ({ thumbnailUrl: null, isLoading: false })),
}));

vi.mock('@renderer/services/ipc', () => ({
  ipc: ipcMock,
}));

const node: FileSystemNode = {
  path: '/repo/readme.md',
  name: 'readme.md',
  kind: 'file',
  sizeInBytes: 4096,
  modifiedAt: Date.now(),
  createdAt: Date.now() - 1_000,
  isHidden: false,
  extension: 'md',
};

const props = {
  filePath: node.path,
  node,
  onClose: vi.fn(),
  onOpenWithSystem: vi.fn(),
};

describe('file viewer components', () => {
  it('builds morph file URLs for absolute and relative paths', () => {
    expect(morphFileUrl('/Users/a/file name.txt')).toBe('morph-file://local/Users/a/file%20name.txt');
    expect(morphFileUrl('relative.txt')).toBe('morph-file://local/relative.txt');
  });

  it('renders toolbar and dispatches close/open actions', () => {
    const onClose = vi.fn();
    const onOpenWithSystem = vi.fn();
    render(<FileViewerToolbar node={node} onClose={onClose} onOpenWithSystem={onOpenWithSystem} />);

    expect(screen.getByText('readme.md')).toBeTruthy();
    fireEvent.click(screen.getByTitle('Open with default system app'));
    fireEvent.click(screen.getByTitle('Close'));
    expect(onOpenWithSystem).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders text viewer states', () => {
    const { rerender } = render(<TextViewer {...props} />);
    expect(screen.getByText('line one')).toBeTruthy();
    expect(screen.getByText('line two')).toBeTruthy();

    hookState.text = { content: null, error: 'Cannot read file', truncated: false };
    rerender(<TextViewer {...props} />);
    expect(screen.getByText('Cannot read file')).toBeTruthy();

    hookState.text = { content: 'huge', error: null, truncated: true };
    rerender(<TextViewer {...props} />);
    expect(screen.getByText(/too large/i)).toBeTruthy();
  });

  it('renders markdown viewer content and errors', () => {
    const { rerender } = render(<MarkdownViewer {...props} />);
    expect(screen.getByText('Heading')).toBeTruthy();
    expect(screen.getByText('Body')).toBeTruthy();

    hookState.markdown = { content: null, error: 'Markdown failed' };
    rerender(<MarkdownViewer {...props} />);
    expect(screen.getByText('Markdown failed')).toBeTruthy();
  });

  it('renders code viewer loading, truncated, and error states', () => {
    hookState.code = { containerRef: { current: null }, isLoading: true, error: null, truncated: true };
    const { rerender } = render(<CodeViewer {...props} />);
    expect(screen.getByText(/too large/i)).toBeTruthy();

    hookState.code = { containerRef: { current: null }, isLoading: false, error: 'Code failed', truncated: false };
    rerender(<CodeViewer {...props} />);
    expect(screen.getByText('Code failed')).toBeTruthy();
  });

  it('renders image viewer metadata and controls', () => {
    render(<ImageViewer {...props} node={{ ...node, name: 'photo.png', extension: 'png' }} />);

    expect(screen.getByAltText('photo.png')).toBeTruthy();
    expect(screen.getByText('100%')).toBeTruthy();
    expect(screen.getByText('640 × 480')).toBeTruthy();
    fireEvent.click(screen.getByTitle('Zoom in'));
    fireEvent.click(screen.getByTitle('Rotate'));
    expect(hookState.image.zoomIn).toHaveBeenCalledTimes(1);
    expect(hookState.image.rotate).toHaveBeenCalledTimes(1);
  });

  it('renders audio and video players with controls', () => {
    const { rerender } = render(<AudioPlayer {...props} node={{ ...node, name: 'song.mp3', extension: 'mp3' }} />);
    expect(screen.getByText('song.mp3')).toBeTruthy();
    expect(screen.getByText(/MP3/)).toBeTruthy();
    fireEvent.click(screen.getByTitle('Play'));
    fireEvent.click(screen.getByTitle('Mute'));
    expect(hookState.audio.togglePlay).toHaveBeenCalledTimes(1);
    expect(hookState.audio.toggleMute).toHaveBeenCalledTimes(1);

    rerender(<VideoPlayer {...props} node={{ ...node, name: 'movie.mp4', extension: 'mp4' }} />);
    expect(screen.getByTitle('movie.mp4')).toBeTruthy();
    fireEvent.click(screen.getByTitle('Fullscreen'));
    expect(hookState.video.handleFullscreen).toHaveBeenCalledTimes(1);
  });

  it('renders pdf, office, and unknown viewers', () => {
    const onOpenWithSystem = vi.fn();
    const { rerender, container } = render(<PdfViewer {...props} node={{ ...node, name: 'doc.pdf', extension: 'pdf' }} filePath="/repo/doc.pdf" />);
    expect(container.querySelector('canvas') || screen.getByText(/Page 1 of/i)).toBeTruthy();

    rerender(<OfficeViewer {...props} node={{ ...node, name: 'sheet.xlsx', extension: 'xlsx' }} onOpenWithSystem={onOpenWithSystem} />);
    expect(screen.getByText('sheet.xlsx')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /open with system app/i }));
    expect(onOpenWithSystem).toHaveBeenCalledTimes(1);

    rerender(<UnknownViewer {...props} node={{ ...node, name: 'blob.bin', extension: 'bin' }} onOpenWithSystem={onOpenWithSystem} />);
    expect(screen.getByText('.bin file')).toBeTruthy();
  });

  it('renders top-level viewer, opens with system, and closes on escape', () => {
    const onClose = vi.fn();
    render(<FileViewer node={node} onClose={onClose} />);

    expect(screen.getByText('readme.md')).toBeTruthy();
    fireEvent.click(screen.getByTitle('Open with default system app'));
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(ipcMock.invoke).toHaveBeenCalledWith('shell:openWith', { path: '/repo/readme.md' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
