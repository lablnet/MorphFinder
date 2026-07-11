export interface DuplicateFile {
  path: string;
  name: string;
  sizeInBytes: number;
  modifiedAt: number;
  hash: string;
}

export interface DuplicateGroup {
  id: string;
  hash: string;
  sizeInBytes: number;
  files: DuplicateFile[];
}

export interface DuplicateScanRequest {
  roots: string[];
  includeHidden: boolean;
  minSizeBytes?: number;
  scope?: 'workspaces' | 'home' | 'all';
}

export interface DuplicateScanResult {
  groups: DuplicateGroup[];
  scannedCount: number;
  hashedCount: number;
  truncated: boolean;
}
