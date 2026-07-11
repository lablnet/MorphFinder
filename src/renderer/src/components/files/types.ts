import type { FileSystemNode } from '@shared/types/fileSystem';

/** Shared by FileGrid / FileListTable / FileColumnView so FileView.tsx can dispatch
 *  between them without any view knowing about the others. */
export interface FileViewProps {
  nodes: FileSystemNode[];
  selectedPaths: ReadonlySet<string>;
  density: 'compact' | 'comfortable';
  onOpen: (node: FileSystemNode) => void;
  onSelectionChange: (paths: string[], anchorPath?: string) => void;
  onContextMenu: (node: FileSystemNode | null, event: React.MouseEvent) => void;
  onStartRename: (node: FileSystemNode) => void;
  dropDestinationPath: string | null;
  onMove: (paths: string[], destinationDir: string) => void;
  onExternalDrag: (paths: string[]) => void;
}
