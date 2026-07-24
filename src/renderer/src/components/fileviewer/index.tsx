import { useCallback, useEffect } from 'react';
import type { FileSystemNode } from '@shared/types/fileSystem';
import { viewerModeForExtension } from '@shared/types/fileViewer';
import { ipc } from '@renderer/services/ipc';
import { FileViewerToolbar } from './FileViewerToolbar';
import { ImageViewer } from './viewers/ImageViewer';
import { VideoPlayer } from './viewers/VideoPlayer';
import { AudioPlayer } from './viewers/AudioPlayer';
import { PdfViewer } from './viewers/PdfViewer';
import { CodeViewer } from './viewers/CodeViewer';
import { TextViewer } from './viewers/TextViewer';
import { MarkdownViewer } from './viewers/MarkdownViewer';
import { OfficeViewer } from './viewers/OfficeViewer';
import { ArchiveViewer } from './viewers/ArchiveViewer';
import { HtmlViewer } from './viewers/HtmlViewer';
import { UnknownViewer } from './viewers/UnknownViewer';
import type { ViewerProps } from './types';

interface FileViewerProps {
  node: FileSystemNode;
  onClose: () => void;
}

export function FileViewer({ node, onClose }: FileViewerProps): React.JSX.Element {
  const mode = viewerModeForExtension(node.extension);

  const openWithSystem = useCallback(() => {
    void ipc.invoke('shell:openWith', { path: node.path });
  }, [node.path]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [onClose]);

  const viewerProps: ViewerProps = {
    filePath: node.path,
    node,
    onClose,
    onOpenWithSystem: openWithSystem,
  };

  return (
    <div className="file-viewer-overlay absolute inset-0 z-40 flex flex-col bg-shell-surface">
      <FileViewerToolbar
        node={node}
        onClose={onClose}
        onOpenWithSystem={openWithSystem}
      />
      <div className="flex-1 overflow-hidden">
        {mode === 'image' ? <ImageViewer {...viewerProps} /> : null}
        {mode === 'video' ? <VideoPlayer {...viewerProps} /> : null}
        {mode === 'audio' ? <AudioPlayer {...viewerProps} /> : null}
        {mode === 'pdf' ? <PdfViewer {...viewerProps} /> : null}
        {mode === 'code' ? <CodeViewer {...viewerProps} /> : null}
        {mode === 'text' ? <TextViewer {...viewerProps} /> : null}
        {mode === 'markdown' ? <MarkdownViewer {...viewerProps} /> : null}
        {mode === 'office' ? <OfficeViewer {...viewerProps} /> : null}
        {mode === 'archive' ? <ArchiveViewer {...viewerProps} /> : null}
        {mode === 'html' ? <HtmlViewer {...viewerProps} /> : null}
        {mode === 'unknown' ? <UnknownViewer {...viewerProps} /> : null}
      </div>
    </div>
  );
}
