export type FileSystemNodeKind = 'file' | 'directory' | 'symlink';

export interface FileSystemNode {
  /** Absolute path — doubles as the stable identity for selection sets and React keys. */
  path: string;
  name: string;
  kind: FileSystemNodeKind;
  sizeInBytes: number;
  /** Epoch ms rather than Date — survives structured clone across IPC untouched. */
  modifiedAt: number;
  createdAt: number;
  isHidden: boolean;
  /** Lowercased, no dot; empty for directories — keeps icon lookup allocation-free. */
  extension: string;
}

export interface DirectoryListing {
  path: string;
  nodes: FileSystemNode[];
  /** Directory was readable but some entries failed to stat (permissions) —
   *  the UI shows a soft warning instead of failing the whole view. */
  hasPartialResults: boolean;
}

export type FileOperationKind = 'copy' | 'move' | 'trash';

export interface FileOperationRequest {
  kind: FileOperationKind;
  sourcePaths: string[];
  /** Required for copy/move; ignored for trash. */
  destinationDir?: string;
}

export interface FileOperationProgress {
  operationId: string;
  completed: number;
  total: number;
  currentPath: string;
  done: boolean;
  error?: string;
}
