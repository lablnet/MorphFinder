import type { FileSystemNode } from '@shared/types/fileSystem';
import type { FileViewerMode } from '@shared/types/fileViewer';

/** Props shared by all individual viewer sub-components. */
export interface ViewerProps {
  filePath: string;
  node: FileSystemNode;
  onClose: () => void;
  onOpenWithSystem: () => void;
}

/** State tracked by the file viewer overlay. */
export interface FileViewerState {
  node: FileSystemNode;
  mode: FileViewerMode;
}

/** Construct a morph-file:// URL for serving local files through the custom protocol. */
export function morphFileUrl(absolutePath: string): string {
  return `morph-file://local${absolutePath.startsWith('/') ? '' : '/'}${encodeURIComponent(absolutePath).replace(/%2F/g, '/')}`;
}
