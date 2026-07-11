import type { FileSystemNode } from './fileSystem';

export type SmartCollectionId =
  | 'recent'
  | 'large'
  | 'duplicates'
  | 'annotated'
  | 'screenshots'
  | 'old-downloads'
  | 'empty-folders'
  | 'build-artifacts';

export interface SmartCollectionDefinition {
  id: SmartCollectionId;
  label: string;
  description: string;
}

export const SMART_COLLECTIONS: SmartCollectionDefinition[] = [
  {
    id: 'recent',
    label: 'Recent Files',
    description: 'Files and folders changed in the last 7 days',
  },
  {
    id: 'large',
    label: 'Large Files',
    description: 'Files larger than 100 MB',
  },
  {
    id: 'duplicates',
    label: 'Duplicates',
    description: 'Likely duplicate files with matching names and sizes',
  },
  {
    id: 'annotated',
    label: 'Annotated Folders',
    description: 'Files and folders with saved notes or tags',
  },
  {
    id: 'screenshots',
    label: 'Screenshots',
    description: 'Screenshot image files across common folders',
  },
  {
    id: 'old-downloads',
    label: 'Old Downloads',
    description: 'Downloaded files older than 30 days',
  },
  {
    id: 'empty-folders',
    label: 'Empty Folders',
    description: 'Folders with no visible contents',
  },
  {
    id: 'build-artifacts',
    label: 'Build Artifacts',
    description: 'node_modules, dist, build, coverage, and similar folders',
  },
];

export interface SmartCollectionRequest {
  id: SmartCollectionId;
  roots: string[];
  includeHidden: boolean;
}

export interface SmartCollectionResult {
  id: SmartCollectionId;
  nodes: FileSystemNode[];
  scannedCount: number;
  truncated: boolean;
}
