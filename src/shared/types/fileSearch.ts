import type { FileSystemNode } from './fileSystem';

export interface FileSearchRequest {
  rootPath: string;
  query: string;
  includeHidden: boolean;
  maxResults?: number;
  maxDepth?: number;
}

export interface FileSearchResult {
  rootPath: string;
  query: string;
  matches: FileSystemNode[];
  scannedCount: number;
  truncated: boolean;
}
